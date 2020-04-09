
/**
 * [layer] 客服界面
 */

import { UIManager } from "../../framework/ui/UIManager";
import { BaseLayer } from "../../framework/ui/BaseLayer"
import { UtilManager } from "../../framework/common/UtilManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ServiceLayer extends BaseLayer {
    @property(cc.Button)
    btn_close: cc.Button = null;  // 关闭界面
    @property(cc.Button)
    btn_FAQ: cc.Button = null;   // 打开常见问题界面
    @property(cc.Button)
    btn_feedback: cc.Button = null;  // 打开客服反馈界面
    @property(cc.Button)
    btn_online: cc.Button = null;  // 打开在线客服界面
    @property(cc.Node)
    node_FAQ: cc.Node = null;  // 常见问题界面
    @property(cc.Node)
    node_feedback: cc.Node = null;  // 客服反馈界面
    @property(cc.Node)
    node_online: cc.Node = null;  // 在线客服界面
    @property(cc.Node)
    node_FAQItem: cc.Node = null;  // 在线客服item节点
    @property(cc.ScrollView)
    scrollView_FAQ: cc.ScrollView = null;  // 在线客服列表


    private FAQ_list = []
    private feedback_list = []



    onLoad() {
        this.btn_close.node.on('click', () => {
            this.hide()
        })

        this.btn_FAQ.node.on('click', () => {
            this.node_FAQ.active = true
            this.node_feedback.active = false
            this.node_online.active = false
        })

        this.btn_feedback.node.on('click', () => {
            this.node_FAQ.active = false
            this.node_feedback.active = true
            this.node_online.active = false
        })

        this.btn_online.node.on('click', () => {
            this.node_FAQ.active = false
            this.node_feedback.active = false
            this.node_online.active = true
        })



    }

    start() {
        cc.loader.loadRes('JsonText/FAQ', (err, jsonAsset) => {
            for (let itemData of jsonAsset.json.FAQ) {
                this.FAQ_list.push(itemData)
            }
            this.refreshFAQView()
        });

        this.node_FAQ.active = true
        this.node_feedback.active = false
        this.node_online.active = false
    }

    /**
     * 刷新常见问题界面
     * @param data 
     */
    private refreshFAQView(){
        let onFAQListBack = (item: cc.Node, itemData: {}, pos: number) => {
            item.getChildByName("t_que").getComponent(cc.Label).string = itemData["QUE"]
            item.getChildByName("t_ans").getComponent(cc.Label).string = itemData["ANS"]
        }
        UtilManager.GetInstance().initScrollView(this.FAQ_list, onFAQListBack, this.scrollView_FAQ, this.node_FAQItem)
    }

    /**
     * 刷新客服反馈界面
     * @param data 
     */
    private refreshFeedbackView(){
  
    }

    /**
     * 刷新在线客服界面
     * @param data 
     */
    private refreshOnlineView(){

    }
}
