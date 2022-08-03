export function getUrl (url: string): string {
    if(process.browser &&(location.host == "127.0.0.1" || location.host == "192.168.1.6")) {
        return "http://192.168.1.6:3000/" + url
    }

    return "http://42.126.16.55:3000/" + url
}
