/**
 * [layer] 活动界面
 */

import { UIManager } from "../../framework/ui/UIManager";
import { BaseLayer } from "../../framework/ui/BaseLayer"
import { HttpManager } from "../../framework/network/HttpManager"

const { ccclass, property } = cc._decorator;

@ccclass
export default class TaskLayer extends BaseLayer {
    @property(cc.Button)
    btn_close: cc.Button = null  //关闭界面



    onLoad() {
        this.requestActivityList()

        this.btn_close.node.on('click', () => {
            this.hide()
        })
    }

    start() {

    }

    /**
     * 请求活动列表
     */
    public requestActivityList() {
        let self = this
        let callBackActivityList = function (isSucc, taskList: {}) {
            if (isSucc) {
                let data = taskList["list"]
            }
            else {
                cc.log("获取活动列表失败")
            }
        }
        // HttpManager.GetInstance().sendHttp_ActivityList(callBackGameTaskList)
    }


}
