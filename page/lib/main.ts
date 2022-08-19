export function getUrl (url: string): string {
    if(process.browser &&(location.host == "127.0.0.1")) {
        return "http://127.0.0.1:3000/" + url
    }
    return "http://127.0.0.1:3000/" + url
    //return "http://00.000.00.000:0000/" + url
}
