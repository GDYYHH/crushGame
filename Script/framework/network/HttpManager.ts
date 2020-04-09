/**
 * [framework] http管理类
 * - [注意] 如果需要处理浏览器跨域请求, 需要后端(目标url)进行配合才可以实现
 * - [注意] GET方法不允许包含body, 只允许包含query
 * - [注意] 重定向的时候, 需要注意 location 里面的地址, 需要删除一些字符
 */
import { GlobalUser } from "../config/GlobalUser"
import { ClientConfig } from "../config/ClientConfig"

export class HttpManager {
    // 设计成单例模式
    private static _instance: HttpManager = null
    public static GetInstance(): HttpManager {
        if (this._instance == null) {
            this._instance = new HttpManager()
        }
        return this._instance;
    }

    /**
     * http请求
     * @string url            后台连接地址 
     * @string params         方法名
     * @string method         请求类型, 如果服务器没有特殊要求, 请使用'GET'方法
     * @callback callback     请求成功以后的回调函数
     * @string postData       选填, POST时给服务器发送的数据, 一般是JSON数据, 调用JSON.stringify(JsonData) 转换发送
     */
    public sendHttp(url: string, params: string, method: string = 'GET', callback, postData?: string): void {
        let isPost = (method == 'POST') || (method == 'post')
        let requestCode: string = params + "&operatorCode=" + ClientConfig.code_operator + "&channelCode=" + ClientConfig.code_channel
        let requestUrl: string = url + "?" + requestCode

        let xhr = new XMLHttpRequest();
        xhr.responseType = 'text';
        xhr.onerror = () => { cc.error("HttpManager: request onabort") }
        xhr.onabort = () => { cc.warn("HttpManager: request onerror") }
        xhr.ontimeout = () => { cc.warn("HttpManager: request ontimeout") }
        xhr.onreadystatechange = () => {
            cc.log(`HttpManager onReadyStateChange readyState=${xhr.readyState}, status=${xhr.status}`)
            if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
                cc.log(xhr)
                if (xhr.response && xhr.statusText) {
                    const jsonData = JSON.parse(xhr.responseText)
                    callback(jsonData)
                }
                else {
                    throw new Error("HttpManager: HttpData is null")
                }
            }

            // 重定向
            if (xhr.readyState === 4 && xhr.status == 302) {
                // 重新组装请求地址
                let strIndex = url.indexOf('/interface')
                let endIndex = xhr.getResponseHeader("location").indexOf('?')
                let reSetUrl = url.substring(0, strIndex) + xhr.getResponseHeader("location").substring(0, endIndex)

                this.sendHttp(reSetUrl, params, method, callback, postData)
            }
        }

        cc.log("HttpManager: url: ", requestUrl, "  method: ", method)
        if (!isPost) {
            // GET
            if (params != "") {
                xhr.open(method, requestUrl, true)
                xhr.send()
            } else {
                cc.error("HttpManager: sendHttp params is null")
            }
        }
        else {
            // POST, 发送postData
            xhr.open(method, requestUrl)
            xhr.send(postData)
        }
    }

    /**
     * 请求热门游戏列表
     * @Function callback     请求成功以后的回调函数
     */
    public sendHttp_HotGameList(callback: Function) {
        let ostime = new Date().getTime()
        let params: string = "route=getgamelist&userid=" + GlobalUser.user_userID + "&time=" + ostime + "&signature=" + GlobalUser.getSignature(ostime)
        this.sendHttp(ClientConfig.http_url + "/interface", params, "GET", function (jstable) {
            cc.log(jstable)
            if (jstable["data"]["valid"]) {
                callback(true, jstable["data"])
                return
            }
            callback(false, jstable)
        })
    }

    /**
     * 请求游戏战绩列表
     * @Function callback     请求成功以后的回调函数
     */
    public sendHttp_GameRecordList(callback: Function) {
        let ostime = new Date().getTime()
        let params: string = "route=getgamerecord&userid=" + GlobalUser.user_userID + "&time=" + ostime + "&signature=" + GlobalUser.getSignature(ostime)
        this.sendHttp(ClientConfig.http_url + "/interface", params, "GET", function (jstable) {
            cc.log(jstable)
            if (jstable["code"] == "0") {
                callback(true, jstable["data"])
                return
            }
            callback(false, jstable)
        })
    }

    /**
     * 请求任务列表
     * @Function callback     请求成功以后的回调函数
     */
    public sendHttp_GameTaskList(callback: Function) {
        let ostime = new Date().getTime()
        let params: string = "route=gettask&userid=" + GlobalUser.user_userID + "&time=" + ostime + "&signature=" + GlobalUser.getSignature(ostime)
        this.sendHttp(ClientConfig.http_url + "/interface", params, "GET", function (jstable) {
            cc.log(jstable)
            if (parseInt(jstable["code"]) == 0) {
                callback(true, jstable["data"])
                return
            }
            callback(false, jstable)
        })
    }

    /**
     * 请求固定活动
     * @Function callback     请求成功以后的回调函数
     */
    public sendHttp_ActivityList(callback: Function) {
        let ostime = new Date().getTime()
        let params: string = "route=getreward&userid=" + GlobalUser.user_userID + "&time=" + ostime + "&signature=" + GlobalUser.getSignature(ostime)
        this.sendHttp(ClientConfig.http_url + "/interface", params, "GET", function (jstable: any) {
            cc.log(jstable, "活动")
            let recordArray = {}
            if (jstable && jstable["Valid"] === true) {
                let data = jstable["data"]
                if (null != data['list'] && data['valid'] === true) {
                    let list = data["list"]
                    // 首充奖励
                    recordArray["firstRecharge"]  = []
                    let firstRecharge = list["firstRecharge"]
                    if (firstRecharge instanceof Array) {
                        for (let i: number = 0; i < firstRecharge.length; i++) {
                            let temp: object = {}
                            temp['key'] = firstRecharge[i]["Key"]
                            temp['Value'] = firstRecharge[i]["Value"]
                            temp['IsRatio'] = firstRecharge[i]["IsRatio"]
                            recordArray["firstRecharge"].push(temp)
                        }
                    }

                    // 累计充值
                    recordArray["accumulative"]  = []
                    let accumulative = list["accumulative"]
                    if (accumulative instanceof Array) {
                        for (let i: number = 0; i < accumulative.length; i++) {
                            let temp: object = {}
                            temp['key'] = accumulative[i]["Key"]
                            temp['Value'] = accumulative[i]["Value"]
                            temp['IsRatio'] = accumulative[i]["IsRatio"]
                            recordArray["accumulative"].push(temp)
                        }
                    }

                    // 客损返利
                    recordArray["loss"]  = []
                    let loss = list["loss"]
                    if (loss instanceof Array) {
                        for (let i: number = 0; i < loss.length; i++) {
                            let temp: object = {}
                            temp['key'] = loss[i]["Key"]
                            temp['Value'] = loss[i]["Value"]
                            temp['IsRatio'] = loss[i]["IsRatio"]
                            recordArray["loss"].push(temp)
                        }
                    }                   
                }

                callback(true, recordArray)
                return
            } else {
                callback(false)
            }
        })
    }

    /**
     * 请求游戏公告列表
     * @Function callback     请求成功以后的回调函数
     */
    public sendHttp_NoticeList(callback: Function) {
        let noticeHRLList = {
            Notice: [],  // 跑马灯
            HorseRaceLamp: []  // 公告
        }
        let ostime = new Date().getTime()
        let params: string = "userid=" + GlobalUser.user_userID + "&time=" + ostime + "&signature=" + GlobalUser.getSignature(ostime)
        this.sendHttp(ClientConfig.http_url + "/api/Notice/GetNotice", params, "GET", function (jstable) {
            cc.log(jstable, "公告")
            if (jstable["valid"]) {
                let data = jstable["data"]
                let HorseRaceLamp = data["HorseRaceLamp"]
                let Ordinary = data["Ordinary"]

                if (HorseRaceLamp != null) {
                    for (let itemData of HorseRaceLamp) {
                        let item = {
                            Accounts: itemData["Accounts"],
                            Content: itemData["content"],
                            Device: itemData["Device"],
                            Devices: itemData["Devices"],
                            FrequencyCount: itemData["FrequencyCount"],
                            FrequencySecond: itemData["FrequencySecond"],
                            Id: itemData["Id"],
                            ImgUrl: itemData["ImgUrl"],
                            ShowPopup: itemData["ShowPopup"],
                            Title: itemData["Title"],
                            TypeCode: itemData["TypeCode"],
                            UseImg: itemData["UseImg"],
                            UserDeposit: itemData["UserDeposit"]
                        }
                        noticeHRLList.HorseRaceLamp.push(item)
                    }
                }

                if (Ordinary != null) {
                    for (let itemData of Ordinary) {
                        let item = {
                            Accounts: itemData["Accounts"],
                            Content: itemData["content"],
                            Device: itemData["Device"],
                            Devices: itemData["Devices"],
                            FrequencyCount: itemData["FrequencyCount"],
                            FrequencySecond: itemData["FrequencySecond"],
                            Id: itemData["Id"],
                            ImgUrl: itemData["ImgUrl"],
                            ShowPopup: itemData["ShowPopup"],
                            Title: itemData["Title"],
                            TypeCode: itemData["TypeCode"],
                            UseImg: itemData["UseImg"],
                            UserDeposit: itemData["UserDeposit"]
                        }
                        noticeHRLList.Notice.push(item)
                    }
                }
                callback(true, noticeHRLList)
                return
            }
            callback(false, jstable["msg"])
        })
    }

    /**
     * 请求游戏邮件列表
     * @Function callback     请求成功以后的回调函数
     */
    public sendHttp_MailList(callback: Function) {
        let mailList = []  //邮件
        let ostime = new Date().getTime()
        let params: string = "route=GetMobileRollNotice&userid=" + GlobalUser.user_userID + "&time=" + ostime + "&signature=" + GlobalUser.getSignature(ostime)
        this.sendHttp(ClientConfig.http_url + "/interface", params, "GET", function (jstable) {
            cc.log(jstable, "邮件")
            if (jstable["Valid"]) {
                let data = jstable["data"]
                let email = data["email"]
                if (email != null) {
                    for (let itemData of email) {
                        let item = {
                            Id: itemData["id"],
                            Title: itemData["title"],
                            Sender: itemData["sender"],
                            Content: itemData["content"],
                            Data: itemData["date"],
                            Status: itemData["status"]
                        }
                        mailList.push(item)
                    }
                    callback(true, mailList)
                }

            }
            callback(false, jstable["msg"])
        })
    }

    /**
     * 请求设置未读邮件状态
     * @Function emailID      请求设置的邮件id
     * @Function callback     请求成功以后的回调函数
     */
    public sendHttp_CheckMailStatus(emailID: number, callback: Function) {
        let ostime = new Date().getTime()
        let params: string = "route=CheckMobileEmail&userid=" + GlobalUser.user_userID + "&emailID=" + emailID + "&time=" + ostime + "&signature=" + GlobalUser.getSignature(ostime)
        this.sendHttp(ClientConfig.http_url + "/interface", params, "GET", function (jstable) {
            cc.log(jstable, "阅读邮件")
            if (jstable["Valid"]) {
                callback(true)
                return
            }
            callback(false)
        })
    }

    /**
     * 请求删除已读邮件
     * @Function callback     请求成功以后的回调函数
     */
    public sendHttp_DeleteReadMail(callback: Function) {
        let ostime = new Date().getTime()
        let params: string = "route=DeleteMobileEmail&userid=" + GlobalUser.user_userID + "&time=" + ostime + "&signature=" + GlobalUser.getSignature(ostime)
        this.sendHttp(ClientConfig.http_url + "/interface", params, "GET", function (jstable) {
            cc.log(jstable, "删除邮件")
            if (jstable["Valid"]) {
                callback(true)
                return
            }
            callback(false)

        })
    }


    /**
     * 请求余额宝
     * @Function callback     请求成功以后的回调函数
     */
    public sendHttp_YEBRecord(callback: Function, pageIndex?: number, pageSize?: number) {
        pageIndex = pageIndex || 1;
        pageSize = pageSize || 20;
        let ostime = new Date().getTime()
        let params: string = "userid=" + GlobalUser.user_userID + "&time=" + ostime + "&signature=" + GlobalUser.getSignature(ostime) + "&page=" + pageIndex + "&size=" + pageSize
        this.sendHttp(ClientConfig.http_url + "/api/Insure/GetRecord", params, "GET", function (jstable) {
            cc.log(jstable, "余额宝")
            if (jstable["valid"]) {
                callback(true, jstable["data"])
                return
            }
            callback(false)
        })
    }

}