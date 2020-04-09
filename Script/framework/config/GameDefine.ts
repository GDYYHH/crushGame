/**
 * [framework] 客户端网络定义
 * - 这个类一般用来保存和处理游戏服务器连接相关的数据
 */
export class GameDefine {
    public static DESIGN_WIDTH: number = 1334                       // 设计屏幕宽
    public static DESIGN_HEIGTH: number = 750                        // 设计屏幕高

    // 错误数据
    public static INVALID_USERID: number = 0 		                   // 无效用户
    public static INVALID_BYTE: number = 255
    public static INVALID_WORD: number = 65535

    // 数据定义
    public static LEN_VERIF_CODE: number = 8			                     // 验证码
    public static LEN_MOBILE_PHONE: number = 12						         // 移动电话
    public static LEN_COMPELLATION: number = 16			                     // 真实名字
    public static LEN_THIRTYTWO: number = 32			                     // 32
    public static LEN_THIRTYTHREE: number = 33			                     // 33
    public static LEN_ONETWENTEIGHT: number = 128		                     // 128
    public static CONNECT_OK: number = 2304			                         // 连接成功
    public static CONNECT_FAIL: number = 2305			                     // 连接失败
    public static SUCCESS_LOGIN: number = 2010	 	                         // 登录成功
    public static INVALID_LOGIN: number = 65534		                         // 登录失败
    public static INVALID_SEND: number = 2303		                         // 发送失败
    public static RESULT_DESCRIP: number = 128		                         // 结果描述

    // 主ID
    public static MAIN_SOCKET_INFO: number = 0                               // 网络状态
    public static MDM_GP_SERVER_LIST: number = 2		                     // 重新获取游戏列表
    public static MDM_GP_USER_SERVICE: number = 3			                 // 用户服务
    public static MDM_MB_LOGON: number = 100                                 // 登陆命令
    public static MDM_MB_SERVER_LIST: number = 101			                 // 游戏列表

    // 子ID
    public static SUB_MB_LOGON_ACCOUNTS: number = 2				             // 帐号登录
    public static SUB_MB_LOGON_VISITOR: number = 5                           // 游客登录
    public static SUB_SOCKET_CONNECT: number = 1                             // 连接成功
    public static SUB_SOCKET_ERROR: number = 2                               // 连接错误
    public static SUB_SOCKET_CLOSE: number = 3                               // 连接关闭
    public static SUB_MB_LOGON_SUCCESS: number = 100			             // 登录成功
    public static SUB_MB_LOGON_FAILURE: number = 101			             // 登录失败
    public static SUB_MB_LOGON_VERIFY_RESULT: number = 103                   // 验证登录结果
    public static SUB_MB_LIST_FINISH: number = 200                           // 列表接收完成

    public static SUB_GP_SYSTEM_FACE_INFO:number = 122		                 // 修改头像
    public static SUB_GP_MODIFY_INDIVIDUAL:number = 152			             // 修改昵称

    public static SUB_GP_USER_INSURE_SUCCESS: number = 166                   // 银行成功
    public static SUB_GP_USER_INSURE_FAILURE: number = 167                   // 银行失败
    public static SUB_GP_USER_INSURE_ENABLE_RESULT: number = 170             // 开通银行结果
    public static SUB_GP_BASEENSURE_RESULT: number = 263                     // 领取低保结果
    public static SUB_MB_RECHARGESUCCESS: number = 552			             // 充值成功
    public static SUB_MB_NOTIFYIDNEWMAIL: number = 553			             // 新邮件提醒
    public static SUB_GP_USER_SAVE_RESULT: number = 179                      // 存款结果
    public static SUB_GP_USER_TAKE_RESULT: number = 180                      // 取款结果
    public static SUB_MB_RADIO_MESSAGE: number = 550                         // 游戏推送
    public static SUB_GP_ADD_RECHARGE_ORDER_RESULT: number = 184             // 充值结果
    public static SUB_GP_TAKE_SCORE_BY_REBATE_RESULT: number = 383           // 打码量返水结果
    public static SUB_GP_TAKE_SCORE_BY_ATTENDANCE_RESULT: number = 385       // 签到结果
    public static SUB_GP_USER_BIND_MOBILE_RESULT: number = 186			     // 绑定手机结果
    public static SUB_GP_USER_ADD_BANKCARD_RESULT: number = 188			     // 绑定银行卡结果
    public static SUB_GP_EXCHANGESCORE_RESULT: number = 401                  // 兑换结果
    public static SUB_GP_USER_QUERY_SCORE_RESULT: number = 182               // 提现限制
    public static SUB_MB_CUSTOMER: number = 551                              // 客服消息推送
    public static SUB_GP_INDIVIDUAL_RESULT: number = 153                     // 修改个人资料结果
    public static SUB_GP_USER_FACE_INFO: number = 120                        // 修改头像结果
    public static SUB_GP_TASK_INFO: number = 250                             // 加载任务
    public static SUB_GP_TASK_RESULT: number = 252			                 // 任务结果
    public static SUB_GP_LOTTERY_USER_INFO: number = 362			         // 轮盘配置
    public static SUB_GP_LOTTERY_CONFIG: number = 361                        // 奖项配置
    public static SUB_GP_LOTTERY_RECORD: number = 365                        // 抽奖记录
    public static SUB_GP_LOTTERY_RESULT: number = 364                        // 抽奖结果
    public static SUB_GP_TAKE_SCORE_BY_REDEEMCODE_RESULT: number = 381       // 兑换码兑换结果
    public static SUB_GP_RED_PACKER_RESULT: number = 341                     // 领取红包结果
    public static SUB_GP_RED_RECORD_RESULT: number = 344                     // 红包记录
    public static SUB_GP_RED_INFO: number = 342			                     // 所有红包消息
    public static SUB_MB_REDPACKETNOTICE: number = 558			             // 收到红包消息
    public static SUB_MB_USERHALLSCORE: number = 554                         // 强退用户刷新金币
    public static SUB_MB_JACKPOTCHANGE: number = 555                         // 奖池变动
    public static SUB_MB_SYSTEMUPDATE: number = 556                          // 全局在线通知
    public static SUB_MB_OTHERLOGIN: number = 557                            // 别处登录通知
    public static SUB_GP_OPERATE_SUCCESS: number = 500                       // 操作成功
    public static SUB_GP_OPERATE_FAILURE: number = 501			             // 操作失败
    public static SUB_MB_SYSTEM_RADIO_MESSAGE: number = 549			         // 更新系统消息跑马灯

    /**
     * 配置UI
     */
    public static popup_src_config = {
        login: {
            "ToastLayer": "Prefabs/per_toast", //Toast
            "QueryDialogLayer": "Prefabs/per_queryDialog",//QueryDialog
            "LoginLayer": "Prefabs/per_login",//登陆
        },
        plaza: {
            "UserLayer": "Prefabs/userInfoLayer/per_userLayer",           // 个人信息
            "ModifyHeadLayer": "Prefabs/userInfoLayer/per_changeHead",    // 设置头像
            "ModifyNameLayer": "Prefabs/userInfoLayer/per_changeName",    // 修改昵称
            "ActivityLayer": "Prefabs/activityLayer/per_activity",        // 活动

            "AgentLayer": "Prefabs/per_agent",//全民代理
            "NoticeLayer": "Prefabs/per_notice", //公告
            "ServiceLayer": "Prefabs/per_service", //客服
            "ExchangeLayer": "Prefabs/per_exchange", //提现
            "RechargeLayer": "Prefabs/per_recharge", //充值
            "StrongboxLayer": "Prefabs/per_strongbox", //保险柜
            "SignInLayer": "Prefabs/per_signIn",//签到
            "BindRecommenderLayer": "Prefabs/per_bindRecommender",//绑定推荐人
            
            "VerifyLayer": "Prefabs/per_verify", //修改密码:账户//保险柜
            "RegisterLayer": "Prefabs/per_register", //注册送金
            "RegistLayer": "Prefabs/per_regist", //注册账号
        }
    }

    // 棋牌类游戏列表
    public static QPGameList: number[] = [
        101,    // 斗地主
        102,    // 扎金花
        103,    // 抢庄牛牛
        104,    // 跑得快
        105,    // 十三水
        106,    // 510k
        107,    // 三公
        108     // 新港式五张
    ]

    // 百人类游戏列表
    public static BRGameList: number[] =
        [
            401,    // 红包扫雷
            402,    // 推筒子
            403,    // 骰宝
            404,    // 红黑大战
            405,    // 龙虎斗
            406,    // 百家乐
            407     // 百人牛牛
        ]

    // 街机电玩类游戏列表
    public static JJGameList: number[] =
        [
            201,    // 水浒传
            202,    // 水果机
            203,    // 俄罗斯转盘
            204,    // 捕鱼
            205,    // 狮子王国
            206     // 奔驰宝马
        ]

    // 彩票类游戏列表
    public static CPGameList: number[] =
        [
            301,    // 重庆时时彩
            302,    // 六合彩
            303,    // 快三
            304,    // 幸运28
            305,    // PK10
            306     // 一元夺宝
        ]

    // 热门游戏列表
    public static HotGameList: number[] = []
}