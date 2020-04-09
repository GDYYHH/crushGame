/**
 * [layer] 任务界面
 */

import { UIManager } from "../../framework/ui/UIManager";
import { BaseLayer } from "../../framework/ui/BaseLayer"

import { HttpManager } from "../../framework/network/HttpManager"

const { ccclass, property } = cc._decorator;

@ccclass
export default class TaskLayer extends cc.Component {
    @property(cc.Button)
    btn_close: cc.Button = null  //关闭界面



    onLoad() {
        this.requestGameTaskList()

        this.btn_close.node.on('click', () => {
            UIManager.GetInstance().hide("")
        })
    }

    start() {

    }

    /**
     * 请求热门游戏列表
     */
    public requestGameTaskList() {
        let self = this
        let callBackGameTaskList = function (isSucc, taskList: {}) {
            if (isSucc) {
                let data = taskList["list"]
            }
            else {
                cc.log("获取任务列表失败")
            }
        }
        HttpManager.GetInstance().sendHttp_GameTaskList(callBackGameTaskList)
    }


}
