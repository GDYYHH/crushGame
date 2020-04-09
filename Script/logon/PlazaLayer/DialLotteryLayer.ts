/**
 * [layer] 抽奖界面
 */

import { UIManager } from "../../framework/ui/UIManager";
import { BaseLayer } from "../../framework/ui/BaseLayer"
import { HttpManager } from "../../framework/network/HttpManager"
import { UtilManager } from "../../framework/common/UtilManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TaskLayer extends BaseLayer {
    @property(cc.Button)
    btn_close: cc.Button = null  //关闭界面
    @property(cc.Node)
    node_recordItem: cc.Node = null  // 抽奖记录item
    @property(cc.Node)
    node_allRecordItem: cc.Node = null  // 大奖记录item
    @property(cc.ScrollView)
    scrollView_record: cc.ScrollView = null  //抽奖记录列表
    @property(cc.ScrollView)
    scrollView_allRecord: cc.ScrollView = null  //大奖记录列表

    listData: number[] = []



    onLoad() {
        // this.requestDialConfig()

        this.btn_close.node.on('click', () => {
            this.hide()
        })
        for (let index = 1; index < 20; index++) {
            this.listData.push(index) 
        }
        UtilManager.GetInstance().initScrollView(this.listData, this.onBackScroll, this.scrollView_record, this.node_recordItem)

    }

    start() {

    }

    private onBackScroll(item: cc.Node, data: any, idx: number){
        item.getChildByName("t_score").getComponent(cc.Label).string = data
    }

    /**
     * 请求轮盘配置信息
     */
    public requestDialConfig() {
        let self = this
        let callBackDialConfig = function (isSucc, taskList: {}) {
            if (isSucc) {
                let data = taskList["list"]
            }
            else {
                cc.log("获取轮盘配置信息失败")
            }
        }
        // HttpManager.GetInstance().sendHttp_DialConfig(callBackDialConfig)
    }


}
