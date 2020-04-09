/**
 * [framework] 客户端本地储存
 * - 这个类一般用来保存玩家的数据
 */
import { ClientConfig } from "../config/ClientConfig"
import { UtilManager } from "../common/UtilManager";

export class GlobalUser {
    // 设计成单例模式
    private static Instance: GlobalUser = null;
    public static GetInstance(): GlobalUser {
        if (this.Instance == null) {
            this.Instance = new GlobalUser();
        }
        return this.Instance;
    }
    public allKeyData: string[] = []              // 储存所有的key值
    public static user_faceID: number = 0                 // 用户头像ID
    public static user_gender: number = 0                 // 用户性别(女: 0, 男: 1)
    public static user_customID: number = 0                 // 用户自定义头像ID
    public static user_userID: number = 0                 // 用户ID
    public static user_gameID: number = 0                 // 用户游戏ID
    public static user_spreaderID: number = 0                 // 用户推广ID
    public static user_experience: number = 0                 // 用户经验值
    public static user_account: string = ''                // 用户账号
    public static user_name: string = ""                // 用户昵称
    public static user_aliAcccount: string = ""                // 支付宝账号
    public static user_bankCode: string = ""                // 银行卡号
    public static user_password: string = "ZZYKKK@#$222"    // 用户密码
    public static user_dynamicPass: string = ""                // 动态密码
    public static user_mobile: string = "13378787878"     // 用户手机号码
    public static user_goldScore: number = 0                 // 用户金币余额
    public static user_bankScore: number = 0                 // 用户银行余额
    public static user_cumulative: number = 0                 // 用户银行累计收益
    public static insureEnabled: number = 0                 // 使能标识
    public static isAngentAccount: boolean = false            // 是否是代理
    public static lockMachine: number = 0                 // 锁定机器
    public static todayAlmsCount: number = 0                 // 每日低保已领取次数
    public static lockServerID: number = 0                 // 锁定房间
    public static lockKindID: number = 0                 // 锁定游戏

    public static operate_ID: number = 2                 // 登录方式(0: 账号登录, 1: 微信登录, 2: 游客登录)
    public static is_vistor: boolean = true             // 是否是游客登录
    public static vistor_password: string = ''                // 游客登录默认密码
    public static curGame_kind: number = 0                 // 当前游戏的kindId


    /**
     * 保存数据到本地(一般用于保存用户ID, 昵称之类的数据, 用于下一次启动时显示)
     * @string key 键, 具有唯一性, 设置时最好全局搜索一下有没有要传入的这个key
     * @any value 值
     */
    public setLocalData(key: string, value: any) {
        for (let index: number = 0; index < this.allKeyData.length; index++) {
            if (this.allKeyData[index] == key) {
                return
            }
        }

        this.allKeyData.push(key)
        let data = JSON.stringify(value)
        cc.sys.localStorage.setItem(key, data)
    }

    /**
     * 获取数据
     * @param key 键
     */
    public getLocalData(key: string): string {
        let value = cc.sys.localStorage.getItem(key)
        if (value != null) {
            return JSON.parse(value)
        }
        else {
            return ""
        }
    }

    /**
     * 删除指定数据
     * @string key 键
     */
    public deletData(key: string) {
        cc.sys.localStorage.removeItem(key)
    }

    /**
     * 删除所有数据
     */
    public deletAllData() {
        cc.sys.localStorage.clear()
    }

    /**
     * 获取子游戏的房间信息
     * @string kindID 游戏ID
     */
    public static getGameRoom(kindID: string) {
        let checkKind: number
        if (undefined == kindID || null == kindID) {
            checkKind = GlobalUser.curGame_kind
        } else {
            checkKind = parseInt(kindID)
        }

        for (let key in ClientConfig.room_list) {
            let list: string = ClientConfig.room_list[key]
            if (parseInt(list[1]) === checkKind) {
                if (undefined == list[2] || null == list[2]) {
                    return {}
                }

                return list[2]
            }
        }

        return {}
    }

    /**
     * 保存用户信息缓存(关闭游戏时会清除掉)
     * @buffer 
     */
    public static setCacheData(buffer: any) {
        if (null == buffer) {
            return
        }

        // 基本信息
        buffer.setCurrByteIndex(12)
        this.user_faceID = buffer.getWord()
        cc.log(this.user_faceID, "用户头像")
        this.user_gender = buffer.getByte()
        this.user_customID = buffer.getDword()
        this.user_userID = buffer.getDword()
        this.user_gameID = buffer.getDword()
        this.user_spreaderID = buffer.getDword()
        this.user_experience = buffer.getDword()
        this.user_account = buffer.getString(32)
        this.user_name = buffer.getString(32)
        this.user_aliAcccount = buffer.getString(30)
        this.user_bankCode = buffer.getString(20)
        this.user_dynamicPass = buffer.getString(33)
        this.user_mobile = buffer.getString(12)

        // 财富信息
        this.user_goldScore = buffer.getDouble()
        this.user_bankScore = buffer.getDouble()
        this.user_cumulative = buffer.getDouble()

        // 扩展信息
        this.insureEnabled = buffer.getByte()
        let bAngent: number = buffer.getByte() || 0
        this.isAngentAccount = (bAngent == 1)
        this.lockMachine = buffer.getByte()

        // 游戏相关
        this.todayAlmsCount = buffer.getInt()
        this.lockServerID = buffer.getDword()
        this.lockKindID = buffer.getDword()
        cc.log("玩家登录信息--> 账号:  ", this.user_account, "  手机号:  ", this.user_mobile, "  金币:  ", this.user_goldScore)
    }

    /**
     * 连接后台时的签名文件
     * @number times 当前时间戳
     */
    public static getSignature(times: number) {
        let pstr: string = "" + this.user_userID + this.user_dynamicPass + times + "Z@#$!ValidKey112233"
        let code: string = UtilManager.md5(pstr)
        return code
    }
}