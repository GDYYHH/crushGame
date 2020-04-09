/**
 * [CMD] 登录相关消息结构体
 * Lua结构体转为TS结构体时, string类型全部改为tchar类型
 */
import { GameDefine } from "../../framework/config/GameDefine";

export class CMD_Logon {
    //账号注册
    public static CMD_MB_RegisterAccounts = [
        // 系统信息
        { k: "wModuleID", t: "word" },									           // 模块标识
        { k: "dwPlazaVersion", t: "dword" },									   // 广场版本
        { k: "cbDeviceType", t: "byte" },									       // 设备类型
        { k: "szLogonPass", t: "tchar", s: GameDefine.LEN_THIRTYTHREE },				   // 登录密码
        { k: "wFaceID", t: "word" },									           // 头像标识
        { k: "cbGender", t: "byte" },									           // 用户性别
        { k: "szAccounts", t: "tchar", s: GameDefine.LEN_THIRTYTWO },			   // 登陆账号
        { k: "szNickName", t: "tchar", s: GameDefine.LEN_THIRTYTWO },			   // 用户昵称
        { k: "dwSpreaderGameID", t: "dword" },									   // 推荐标识
        // 连接信息
        { k: "szMachineID", t: "tchar", s: GameDefine.LEN_THIRTYTHREE },			   // 机器标识
        { k: "szIP", t: "tchar", s: GameDefine.LEN_THIRTYTWO },                    // 客户端IP
        { k: "szRegisterMobile", t: "tchar", s: GameDefine.LEN_MOBILE_PHONE },	   // 注册手机号码
        // 运营商和渠道信息
        { k: "wOperator", t: "word" },									           // 运营商编号
        { k: "wChannel", t: "word" },									           // 渠道编号
        // 可选配置信息
        { k: "zsCompellation", t: "tchar", s: GameDefine.LEN_COMPELLATION },	   // 真实名字
        { k: "szEmail", t: "tchar", s: GameDefine.LEN_THIRTYTHREE },		               // 邮箱
        { k: "szQQ", t: "tchar", s: GameDefine.LEN_COMPELLATION },		           // QQ号
        { k: "szWeChat", t: "tchar", s: GameDefine.LEN_THIRTYTHREE },		               // 微信号
        { k: "szMobilePhone", t: "tchar", s: GameDefine.LEN_MOBILE_PHONE },		   // 电话号码
        { k: "szVerifyCode", t: "tchar", s: GameDefine.LEN_VERIF_CODE },		   // 注册验证码
        { k: "szAgentID", t: "tchar", s: GameDefine.LEN_THIRTYTWO }				   // 代理标识
    ]

    //手机号登录
    public static CMD_MB_LoginAccounts = [
        // 系统信息
        { k: "wModuleID", t: "word" },									           // 模块标识
        { k: "dwPlazaVersion", t: "dword" },									   // 广场版本
        { k: "cbDeviceType", t: "byte" },									       // 设备类型
        { k: "szLogonPass", t: "tchar", s: GameDefine.LEN_THIRTYTHREE },				   // 登录密码
        { k: "szAccounts", t: "tchar", s: GameDefine.LEN_THIRTYTWO },			   // 登陆账号
        // 连接信息
        { k: "szMachineID", t: "tchar", s: GameDefine.LEN_THIRTYTHREE },			   // 机器标识
        { k: "szIP", t: "tchar", s: GameDefine.LEN_THIRTYTWO },                    // 客户端IP
        { k: "szRegisterMobile", t: "tchar", s: GameDefine.LEN_MOBILE_PHONE },	   // 注册手机号码
        // 运营商和渠道信息
        { k: "wOperator", t: "word" },									           // 运营商编号
        { k: "wChannel", t: "word" },									           // 渠道编号
    ]


    // 游客登录
    public static CMD_MB_LogonVisitor = [
        // 系统信息
        { k: "wModuleID", t: "word" },                                                                // 模块标识
        { k: "dwPlazaVersion", t: "dword" },								                          // 广场版本
        { k: "cbDeviceType", t: "byte" },                       			                          // 设备类型
        // 连接信息
        { k: "szMachineID", t: "tchar", s: GameDefine.LEN_THIRTYTHREE },			                      // 机器标识
        { k: "szIP", t: "tchar", s: GameDefine.LEN_THIRTYTWO },                                       // 客户端IP长度
        // 运营商和渠道信息
        { k: "wOperator", t: "word" },                                                                // 运营商编号
        { k: "wChannel", t: "word" },                                                                 // 渠道编号
        // 可选配置信息
        { k: "zsCompellation", t: "tchar", s: GameDefine.LEN_COMPELLATION },		                  // 真实名字
        { k: "szEmail", t: "tchar", s: GameDefine.LEN_THIRTYTHREE },		                                  // 邮箱
        { k: "szQQ", t: "tchar", s: GameDefine.LEN_COMPELLATION },		                              // QQ号
        { k: "szWeChat", t: "tchar", s: GameDefine.LEN_THIRTYTHREE },		                                  // 微信号
        { k: "szMobilePhone", t: "tchar", s: GameDefine.LEN_MOBILE_PHONE },		                      // 电话号码
        { k: "szVerifyCode", t: "tchar", s: GameDefine.LEN_VERIF_CODE },		                      // 注册验证码
        { k: "szAgentID", t: "tchar", s: GameDefine.LEN_THIRTYTWO }				                      // 代理标识
    ]

    // 接收登录验证回复
    public static CMD_MB_LogonVerifyResult = [
        { k: "lResultCode", t: "int" },                                                                  // 验证结果
        { k: "szDescribeString", t: "tchar" },                                                           // 描述
    ]

    // 接收登录失败结果
    public static CMD_MB_LogonFailure = [
        { k: "lResultCode", t: "int" },										                           // 错误代码
        { k: "szDescribeString", t: "tchar" },								                           // 描述消息
    ]

    // 接收修改昵称结果
    public static CMD_GP_INDIVIDUAL_RESULT = [
        { k: "bSuccessed", t: "bool" },                                                                // 成功标识
        { k: "szNotifyContent", t: "tchar", s: GameDefine.LEN_ONETWENTEIGHT },                         // 提示内容
    ]

    // 发送修改头像
    public static CMD_GP_SystemFaceInfo = [
        { k: "wFaceID", t: "word" },										                            // 头像id
        { k: "dwUserID", t: "dword" },								                                    // 用户id
        { k: "szPassword", t: "tchar", s: GameDefine.LEN_THIRTYTHREE },								    // 用户密码
        { k: "szMachineID", t: "tchar", s: GameDefine.LEN_THIRTYTHREE },								// 机器序列
    ]

    // 接收修改头像结果
    public static CMD_GP_UserFaceInfo = [
        { k: "bSuccessed", t: "bool" },										                            // 成功标识
        { k: "wFaceID", t: "word" },	                                                                // 头像id
        { k: "szNotifyContent", t: "tchar", s: GameDefine.RESULT_DESCRIP },								// 机器序列
    ]
}