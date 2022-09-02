import os,json
from flask import Flask,jsonify,request
from datetime import datetime, timedelta, timezone
from sqlalchemy import func
from flask_jwt_extended import get_current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required,JWTManager \
    ,get_jwt,get_jwt_identity,current_user,create_refresh_token

basedir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__, instance_relative_config=True)
app.config.from_mapping(
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')
    ,SQLALCHEMY_TRACK_MODIFICATIONS = False
    ,SECRET_KEY = "secret"
    ,JWT_SECRET_KEY = "secret"
    ,JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=3)
    ,JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    ,JWT_TOKEN_LOCATION = "headers"

    ,JSON_AS_ASCII = False
)
cors = CORS(app, responses={r"/*": {"origins": "*"}})
db = SQLAlchemy(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

followers = db.Table('followers',
    db.Column('follower', db.Integer, db.ForeignKey('user.id')),
    db.Column('followed', db.Integer, db.ForeignKey('user.id'))
)

class User(db.Model):  # type: ignore
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(128))
    memo = db.Column(db.String(1024))
    user_icon = db.Column(db.String(512), default = "d.png")
    followed = db.relationship(
        'User', secondary=followers,
        primaryjoin=(followers.c.follower == id),
        secondaryjoin=(followers.c.followed == id),
        backref=db.backref('followers', lazy='dynamic'), lazy='dynamic')
    def followed_posts(self):
        return Post.query.join(
            followers, (followers.c.followed == Post.user_id)).filter(
                followers.c.follower == self.id).order_by(
                    Post.timestamp.desc())
    def follow(self, user):
        if not self.isFollowing(user):
            self.followed.append(user)
    def unFollow(self, user):
        if self.isFollowing(user):
            self.followed.remove(user)
    def isFollowing(self, user):
        return self.followed.filter(
            followers.c.followed == user.id
        ).count() > 0
    def set_password(self, password):
        self.password = generate_password_hash(password)
    def check_password(self, password):
        return check_password_hash(self.password, password)
    def __repr__(self):
        return "[id:{}, username:{}]".format(self.id, self.username)
class TokenBlocklist(db.Model): # type: ignore
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True)
    type = db.Column(db.String(16), nullable=False)
    user_id = db.Column(db.ForeignKey('user.id'), default=lambda: get_current_user().id, nullable=False)
    created_at = db.Column(db.DateTime, server_default=func.now(), nullable=False)

#main
###########################################################################################
###########################################################################################
###########################################################################################
import random
from flask import send_from_directory
from werkzeug.utils import secure_filename

uploads_image_path = os.path.join(basedir, 'images')
uploads_icon_path = os.path.join(basedir, 'icons')
class Post(db.Model): # type: ignore
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(16), default="post")
    title = db.Column(db.String(400))
    body = db.Column(db.String(4096), default="")
    timestamp = db.Column(db.DateTime, index=True, server_default=func.now())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    likes = db.Column(db.String(), default=str({'liker':[],'disliker':[]}).replace("'",'"'))
    rating = db.Column(db.Integer, default=0, index=True)
    comments = db.Column(db.Integer, default=0, index=True)
class Comment(db.Model): # type: ignore
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(400), default="")
    body = db.Column(db.String(4096), default="")
    timestamp = db.Column(db.DateTime, index=True, server_default=func.now())
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

@app.route("/post/get/one/<id>", methods=['GET'])
@cross_origin()
def get_one_post(id):
    try:
        id_ = int(id)
    except:
        return jsonify("id = none"),400
    #post = Post.query.filler_by(id=id).first()
    post = Post.query.filter_by(id=id_).first()
    if not post:
        return jsonify("post not found"),404
    u = User.query.filter_by(id=post.user_id).first()
    r = {
        "id": post.id
        ,"type": post.type
        ,"title": post.title
        ,"text":post.body
        ,"username":u.username
        ,"timestamp": str(post.timestamp)
        ,"rating":post.rating
        ,"comments":post.comments
        ,"icon": u.user_icon
    }
    return jsonify(json.dumps(r)),200

#//@app.route("/get_one_post_logins/<id>", methods=["GET"])
@app.route("/post/get/one/login/<id>", methods=["GET"])
@cross_origin()
@jwt_required()
def get_one_post_login(id):
    try:
        id_ = int(id)
    except:
        return jsonify("id = none"),400
    #post = Post.query.filter_by(id=id).first()
    post = Post.query.filter_by(id=id_).first()
    if not post:
        return jsonify("post not found"),404
    u = User.query.filter_by(id=post.user_id).first()
    username = current_user.username # type: ignore
    like = None
    likes = json.loads(post.likes)
    try:
        index = likes["liker"].index(username)
        like = True
    except ValueError:
        try:
            index = likes["disliker"].index(username)
            like = False
        except:
            like = None
    r = {
        "id": post.id
        ,"type": post.type
        ,"title": post.title
        ,"text":post.body
        ,"username":u.username
        ,"timestamp": str(post.timestamp)
        ,"rating":post.rating
        ,"comments":post.comments
        ,"like":like
        ,"icon": u.user_icon
    }
    return jsonify(json.dumps(r)),200

@app.route("/comment", methods=['POST'])
@cross_origin()
@jwt_required()
def add_comment():
    title = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["title"]
    body = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["text"]
    post_id = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["id"]
    post_id = int(post_id)
    user_id = current_user.id  # type: ignore
    p = Post.query.filter_by(id=post_id).first()
    db.session.add(Comment(title=title,body=body,post_id=post_id,user_id=user_id))
    p.comments += 1
    db.session.add(p)
    db.session.commit()
    u = User.query.get(current_user.id)  # type: ignore
    r = {
        "username": current_user.username  # type: ignore
        ,"icon":u.user_icon
    }
    return jsonify(r),201


@app.route("/comment/get/<id>", methods=["GET"])
@cross_origin()
def get_post_comment(id):
    id = int(id)
    comments = Comment.query.filter_by(post_id = id).order_by(Comment.timestamp.desc()).all()
    result = []
    if comments:
        for c in comments:
            u = User.query.filter_by(id=c.user_id).first()
            r = {
                "id": c.id
                ,"title": c.title
                ,"text": c.body
                ,"timestamp": str(c.timestamp)
                ,"username": u.username
                ,"icon": u.user_icon
            }
            result.append(r)
    return jsonify(json.dumps(result)),200

@app.route("/images/<path>")
@cross_origin()
def send_image(path):
    return send_from_directory(uploads_image_path,path)

@app.route("/icons/<path>")
@cross_origin()
def send_icon(path):
    return send_from_directory(uploads_icon_path,path)

@app.route("/me/icon", methods=["GET"])
@cross_origin()
@jwt_required()
def get_my_icon():
    id = current_user.id  # type: ignore
    u = User.query.get(id)
    return jsonify({"name":u.user_icon})

#ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg'])
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])
def allowed_file(filename):
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
@app.route("/post/image", methods=["POST"])
@cross_origin()
@jwt_required()
def add_post_image():
    type = request.form["type"]
    title = request.form["title"]
    id=current_user.id  # type: ignore
    if "file" not in request.files:
        return jsonify("file not found"), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify("filename not found"), 400
    if file.filename and file and allowed_file(file.filename):
        random_str = generate_random_str(30)
        filename = secure_filename(random_str+"_"+file.filename)
        file.save(os.path.join(uploads_image_path, filename))
        db.session.add(Post(type=type,title=title,body=filename, user_id=id))
        db.session.commit()
        return jsonify("ok"),200
    return jsonify("error"),400

@app.route("/post/icon", methods=["POST"])
@cross_origin()
@jwt_required()
def add_user_icon():
    id = current_user.id  # type: ignore
    if "file" not in request.files:
        return jsonify("file not found"), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify("filename not found"), 400
    if file.filename and file and allowed_file(file.filename):
        random_str = generate_random_str(30)
        filename = secure_filename(random_str+"_"+file.filename)
        file.save(os.path.join(uploads_icon_path, filename))
        u = User.query.get(id)
        u.user_icon = filename
        db.session.add(u)
        db.session.commit()
        return jsonify("ok"),200
    return jsonify("error"),400

def generate_random_str(length: int) -> str:
    a,r = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",""
    for i in range(length):r += random.choice(a)
    return r


@app.route('/post', methods=['POST'])  # type: ignore
@jwt_required()
@cross_origin()
def add_post():
    type = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["type"]
    title = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["title"]
    text = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["text"]
    id=current_user.id  # type: ignore
    #print(text,id)
    #user = User.query.get(id)
    db.session.add(Post(type=type,title=title,body=text, user_id=id))
    db.session.commit()
    return jsonify("created"),200

def get_post_sort(type: str = "new", start:int = 0, end:int = 10):
    if type == "new":
        return Post.query.order_by(Post.timestamp.desc()).limit(end).all()[start:]
    if type == "trending":
        from sqlalchemy import desc
        return Post.query.order_by(desc(Post.rating)).limit(end).all()[start:]
    if type == "image":
        return Post.query.filter_by(type = "image").limit(end).all()[start:]

@app.route('/post/get', methods=['POST']) # type: ignore
@cross_origin()
def get_post():
    try: start = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["start"]
    except: start = 0
    if not start: start = 0
    
    try: end = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["end"]
    except: end = 10
    if not end: end = 10
    
    try: type = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["type"]
    except: type = "new"
    if not type: type = "new"
    
    #posts = Post.query.order_by(Post.timestamp.desc()).limit(end).all()[start:]
    posts = get_post_sort(type = type, start = start, end = end)
    result = []
    if posts:
        for i in posts:
            u = User.query.filter_by(id=i.user_id).first()
            r = {
                "id": i.id
                ,"type": i.type
                ,"title": i.title
                ,"text":i.body
                ,"username":u.username
                ,"timestamp": str(i.timestamp)
                ,"rating":i.rating
                ,"comments":i.comments
                ,"icon":u.user_icon
            }
            result.append(r)
    return jsonify(json.dumps(result)),200

@app.route('/post/get/login', methods=['POST'])
@cross_origin()
@jwt_required()
def get_post_login():
    try: start = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["start"]
    except: start = 0
    if not start: start = 0

    try: end = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["end"]
    except: end = 10
    if not end: end = 10

    try: type = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["type"]
    except: type = "new"
    if not type: type = "new"

    username=current_user.username  # type: ignore
    #posts = Post.query.order_by(Post.timestamp.desc()).limit(end).all()[start:]
    posts = get_post_sort(type = type, start = start, end = end)
    result = []
    if posts:
        for p in posts:
            u = User.query.filter_by(id=p.user_id).first()
            like = None
            likes = json.loads(p.likes)
            try:
                index = likes["liker"].index(username)
                like = True
            except ValueError:
                try:
                    index = likes["disliker"].index(username)
                    like = False
                except:
                    like = None
            r = {
                "id": p.id
                ,"type": p.type
                ,"title": p.title
                ,"text":p.body
                ,"username":u.username
                ,"timestamp": str(p.timestamp)
                ,"rating":p.rating
                ,"comments":p.comments
                ,"like":like
                ,"icon":u.user_icon
            }
            result.append(r)
    return jsonify(json.dumps(result)),200

@app.route("/post/like/<id>", methods=["GET"])
@cross_origin()
@jwt_required()
def post_add_like(id):
    p = Post.query.filter_by(id=int(id)).first()
    username = current_user.username  # type: ignore
    if not p:
        return jsonify("not found"),404
    like = json.loads(p.likes)
    try:
        index = like["disliker"].index(username)
        del(like["disliker"][index])
        like["liker"] += [username]
        like = str(like).replace("'",'"')
        p.likes = like
        p.rating += 2
        db.session.add(p)
        db.session.commit()
        return jsonify({"rating":p.rating,"like":True}), 200
    except ValueError:
        like = json.loads(p.likes)
        try:
            index = like["liker"].index(username)
            del(like["liker"][index])
            like = str(like).replace("'",'"')
            p.likes = like
            p.rating -= 1
            db.session.add(p)
            db.session.commit()
            return jsonify({"rating":p.rating,"like":None}), 200
        except ValueError:
            like = json.loads(p.likes)
            like["liker"] += [username]
            like = str(like).replace("'",'"')
            p.likes = like
            p.rating += 1
            db.session.add(p)
            db.session.commit()
            return jsonify({"rating":p.rating,"like":True}), 200
    return jsonify("error"), 500

@app.route("/post/dislike/<id>", methods=["GET"])
@cross_origin()
@jwt_required()
def post_add_dislike(id):
    p = Post.query.filter_by(id=int(id)).first()
    username = current_user.username  # type: ignore
    if not p:
        return jsonify("not found"),404
    like = json.loads(p.likes)
    try:
        index = like["liker"].index(username)
        del(like["liker"][index])
        like["disliker"] += [username]
        like = str(like).replace("'",'"')
        p.likes = like
        p.rating -= 2
        db.session.add(p)
        db.session.commit()
        return jsonify({"rating":p.rating,"like":False}), 200
    except ValueError:
        like = json.loads(p.likes)
        try:
            index = like["disliker"].index(username)
            del(like["disliker"][index])
            like = str(like).replace("'",'"')
            p.likes = like
            p.rating += 1
            db.session.add(p)
            db.session.commit()
            return jsonify({"rating":p.rating,"like":None}), 200
        except ValueError:
            like = json.loads(p.likes)
            like["disliker"] += [username]
            like = str(like).replace("'",'"')
            p.likes = like
            p.rating -= 1
            db.session.add(p)
            db.session.commit()
            return jsonify({"rating":p.rating,"like":False}), 200
    return jsonify("error"), 500

@app.route("/follow", methods=["POST"])
@cross_origin()
@jwt_required()
def follow_user():
    username = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["username"]
    res = follow_and_unFollow(me = current_user.id, username = username, type = "follow")  # type: ignore
    return jsonify(res)

@app.route("/unfollow", methods=["POST"])
@cross_origin()
@jwt_required()
def unFollow_user():
    username = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["username"]
    res = follow_and_unFollow(me = current_user.id, username = username, type = "unFollow")  # type: ignore
    return jsonify(res)

def follow_and_unFollow(me: int, username: str, type: str):
    #user = User.query.fillter_by(username = username).first()
    user = User.query.filter_by(username=username).first()
    me = User.query.get(me)
    if user is None or user == me:
        return False
    if type == "follow":
        me.follow(user)  # type: ignore
        db.session.commit()
        return True
    if type == "unFollow":
        me.unFollow(user) # type: ignore
        db.session.commit()
        return True
    return False

@app.route("/post/get/follow", methods = ["POST"])
@cross_origin()
@jwt_required()
def get_post_follow():

    try: start = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["start"]
    except: start = 0
    if not start: start = 0
    try: end = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["end"]
    except: end = 10
    if not end: end = 10

    username=current_user.username  # type: ignore
    me = current_user
    #posts = Post.query.order_by(Post.timestamp.desc()).limit(end).all()[start:]
    #posts = get_post_sort(type = type, start = start, end = end)
    posts = me.followed_posts().limit(end).all()[start:]  # type: ignore
    result = []
    if posts:
        for p in posts:
            u = User.query.filter_by(id=p.user_id).first()
            like = None
            likes = json.loads(p.likes)
            try:
                index = likes["liker"].index(username)
                like = True
            except ValueError:
                try:
                    index = likes["disliker"].index(username)
                    like = False
                except:
                    like = None
            r = {
                "id": p.id
                ,"type": p.type
                ,"title": p.title
                ,"text":p.body
                ,"username":u.username
                ,"timestamp": str(p.timestamp)
                ,"rating":p.rating
                ,"comments":p.comments
                ,"like":like
                ,"icon":u.user_icon
            }
            result.append(r)
    return jsonify(json.dumps(result)),200

###########################################################################################
###########################################################################################
###########################################################################################

@jwt.user_identity_loader
def user_identity_lookup(user):
    u = User.query.filter_by(username=user).first()
    if type(user) is int:
        u = User.query.filter_by(id=user).first()
    if u == None:return
    return u.id

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return User.query.filter_by(id=identity).one_or_none()

@jwt.token_in_blocklist_loader
def token_block(_jwt_header, jwt_data):
    if TokenBlocklist.query.filter_by(jti=jwt_data["jti"]).first():
        return True
    return False

@app.route('/register', methods=['POST'])
@cross_origin()
def register():
    username = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["username"]
    password = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["password"]
    if password is None or username is None or password == "" or username == "": return jsonify({"msg": "password or username has not been entered"}), 400
    if len(password) < 5: return jsonify({"msg": "password is too short"}), 400
    if len(username) < 3: return jsonify({"msg": "username is too short"}), 400
    if User.query.filter_by(username=username).first() is not None: return jsonify({"msg": "The username is already in use"}), 409
    user = User(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify("create account")

@app.route('/token', methods=['POST'])
@cross_origin()
def create_token():
    username = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["username"]
    password = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["password"]
    user = User.query.filter_by(username=username).first()
    if user is None or not user.check_password(password):
        return jsonify({"msg": "Incorrect password or username"}), 401
    access_token = create_access_token(identity=username)
    refresh_token = create_refresh_token(identity=username)
    return jsonify(access_token=access_token, refresh_token=refresh_token)

@app.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
@cross_origin()
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify(access_token=access_token)

@app.route("/logout", methods=["DELETE"])
@jwt_required(verify_type=False)
@cross_origin()
def modify_token():
    token = get_jwt()
    jti = token["jti"]
    ttype = token["type"]
    now = datetime.now(timezone.utc)
    db.session.add(TokenBlocklist(jti=jti, type=ttype, created_at=now))
    db.session.commit()
    return jsonify(msg=f"{ttype.capitalize()} token successfully revoked")


@app.route("/token/test", methods=["GET"])
@jwt_required(refresh=True)
@cross_origin()
def test_token():
    return jsonify(True),200

@app.route("/me", methods=["GET"])
@jwt_required()
@cross_origin()
def protected():
    # We can now access our sqlalchemy User object via `current_user`.
    return jsonify(
        id=current_user.id, # type: ignore
        username=current_user.username,  # type: ignore
        password = current_user.password, # type: ignore
    )

@app.route("/test", methods=["GET"])
@cross_origin()
def test():
    return jsonify("ok")

if __name__ == '__main__':
    def addDB(data):
        for d in data:
            db.session.add(d)

    userA = User(username="apple")
    userA.set_password(password="hello, world!")
    postA = Post(type="post", title="test", body="hello, world!", user_id=1)
    commentA = Comment(title="LGTM", body="hello, world!", post_id=1, user_id=1)

    userB = User(username="mango")
    userB.set_password(password="hello, world!")
    postB = Post(type="image", title="test", body="undefined.png", user_id=2)
    commentB = Comment(title="LGTM", body="hello, world!", post_id=2, user_id=2)
    commentA2 = Comment(title="LGTM", body="hello, world!", post_id=2, user_id=1)
    postB2 = Post(type="post", title="test", body="are you ok?", user_id=2)

    userC = User(username="applemango")
    userC.set_password(password="hello, world!")
    postC = Post(type="post", title="test", body="hello", user_id=3)
    commentC = Comment(title="LGTM", body="", post_id=4, user_id=3)
    commentB2 = Comment(title="LGTM", body="", post_id=4, user_id=2)
    commentA3 = Comment(title="LGTM", body="", post_id=4, user_id=1)
    
    addDB([userA,postA,commentA])
    addDB([userB,postB,commentB,commentA2,postB2])
    addDB([userC,postC,commentC,commentB2,commentA3])

    db.drop_all()
    db.create_all()
    db.session.commit()
    app.run(debug=True, host='0.0.0.0', port=3000)
    #from waitress import serve\post\2
    #serve(app, host="0.0.0.0", port=3000)