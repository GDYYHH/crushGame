/**
 * [framework] 客户端缓存数据
 * - 这个类一般用来保存和处理后台服务器连接相关的数据和客户端自己使用定义的数据
 */

export class ClientConfig {
    public static connectOptions = {
        host: "",
    }

    // 后台连接地址, 暂时先写在这里, 后期单独写在一个文件里
    public static code_operator: string = "2F0C4"                   // 运营商号
    public static code_channel: string = "A1C"                      // 渠道号
    public static http_Requst: string = "http://192.168.100.107/interface"                          // 后台登陆服务器地址

    public static allKeyData: string[] = []                         // 储存所有的key值
    public static serverConfig: object = {}                         // 后台服务器数据
    public static netServer_list: object = {}                       // 后台服务器地址列表
    public static gameServer_list: object = {}                      // 游戏服务器地址列表
    public static total_count: number = 0                           // 游戏服务器数量
    public static http_url: string = ''                             // 后台api请求地址
    public static socket_url: string[] = []                         // 当前游戏服务器连接地址
    public static socket_id: number = 0                             // 当前游戏服务器连接id
    public static current_index: number = 0                         // 当前游戏服务器连接地址索引
    public static operator_ID: number = 0                           // 运营商ID
    public static channel_ID: number = 0                            // 渠道ID
    public static game_list: object[] = []                          // 游戏列表
    public static room_list: string[] = []                          // 房间列表

    public static bankRate:number = 0                               // 七日年化

    /**
     * 设置网关
     */
    public static setGateway() {
        this.total_count = Object.keys(this.gameServer_list).length
        this.http_url = this.netServer_list[0]
        this.current_index = 0
        this.socket_url = this.gameServer_list[this.current_index]

        ClientConfig.connectOptions.host = "ws://192.168.100.107:8900"

        cc.log("设置服务器信息:  地址", this.socket_url[0], "  端口", this.socket_url[1])
    }
}