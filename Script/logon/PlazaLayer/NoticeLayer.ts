/**
 * [layer] 公告界面
 */

import { UIManager } from "../../framework/ui/UIManager";
import { BaseLayer } from "../../framework/ui/BaseLayer"
import { HttpManager } from "../../framework/network/HttpManager"
import { UtilManager } from "../../framework/common/UtilManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NoticeLayer extends BaseLayer {
    @property(cc.Button)
    btn_close: cc.Button = null  //关闭界面
    @property(cc.Button)
    btn_notice: cc.Button = null  //打开公告
    @property(cc.Button)
    btn_mail: cc.Button = null  //打开邮件
    @property(cc.Button)
    btn_delete: cc.Button = null  //删除邮件
    @property(cc.Node)
    node_notice: cc.Node = null  //公告面板
    @property(cc.Node)
    node_mail: cc.Node = null  //邮件面板
    @property(cc.Node)
    node_noticeInfo: cc.Node = null  //公告详情面板
    @property(cc.Node)
    node_mailInfo: cc.Node = null  //邮件详情面板
    @property(cc.Node)
    node_noticeItem: cc.Node = null  //公告列表子节点
    @property(cc.Node)
    node_mailItem: cc.Node = null  //邮件列表子节点
    @property(cc.ScrollView)
    scrollView_notice: cc.ScrollView = null  //公告列表
    @property(cc.ScrollView)
    scrollView_mail: cc.ScrollView = null  //邮件列表

    private notice_list = []
    private mail_list = []



    onLoad() {
        this.btn_close.node.on('click', () => {
            this.hide()
        })

        this.btn_notice.node.on('click', () => {
            this.node_notice.active = true
            this.node_mail.active = false
            this.refreshNoticeView()
        })

        this.btn_mail.node.on('click', () => {
            this.node_mail.active = true
            this.node_notice.active = false
            this.refreshMailView()
        })

        this.btn_delete.node.on('click', () => {
            this.onClickDeleteMail()
        })
    }

    start() {
        this.node_notice.active = true
        this.node_mail.active = false
        this.refreshNoticeView()
    }

    /**
     * 刷新公告界面
     * @param data 
     */
    private refreshNoticeView(){
        this.notice_list = this._scene.all_NoticeList
        let onNoticeBack = (item: cc.Node, data:{}, pos: number) => {
            item.getChildByName("t_title").getComponent(cc.Label).string = data["Title"]

            item.on('click', () => {
                cc.log(data["Content"])
                this.node_noticeInfo.active = true
                this.node_noticeInfo.getComponentInChildren(cc.RichText).string = data["Content"]
                this.node_noticeInfo.getChildByName("btn_close").on('click', () => {
                    this.node_noticeInfo.active = false
                })

            })
        }

        UtilManager.GetInstance().initScrollView(this.notice_list, onNoticeBack, this.scrollView_notice, this.node_noticeItem, 10)
    }

    /**
     * 刷新邮件界面
     * @param data 
     */
    private refreshMailView(){
        this.mail_list = this._scene.all_MailList
        if (this.mail_list.length > 0) {
            this.btn_delete.node.active = true
        }
        else{
            this.btn_delete.node.active = false
            return
        }
        let onMailBack = (item: cc.Node, data:{}, pos: number) => {
            item.getChildByName("t_title").getComponent(cc.Label).string = data["Title"]
            item.getChildByName("t_date").getComponent(cc.Label).string = data["Data"]
            item.getChildByName("t_send").getComponent(cc.Label).string = "发件人:" + data["Sender"]
            if (data["Status"] as number == 0) {
                item.getChildByName("sp_icon1").active = true
                item.getChildByName("sp_icon2").active = false
            }
            else{
                item.getChildByName("sp_icon1").active = false
                item.getChildByName("sp_icon2").active = true
            }

            item.on('click', () => {
                cc.log(data["Content"])
                this.onClickMailItem(item, data, data["Status"])
            })
        }

        UtilManager.GetInstance().initScrollView(this.mail_list, onMailBack, this.scrollView_mail, this.node_mailItem, 10)

    }

    /**
     * 点击邮件回调
     * @param item 邮件item
     * @param data 邮件数据
     * @param status 邮件状态  (0 是未读, 1 是已读)
     */
    private onClickMailItem(item: cc.Node, data: {}, status: number){
        if (status == 0) {
            let onClickMailBack = (isSucc: boolean) => {
                if (isSucc) {
                    item.getChildByName("sp_icon1").active = false
                    item.getChildByName("sp_icon2").active = true
                }
            }
            HttpManager.GetInstance().sendHttp_CheckMailStatus(data["Id"], onClickMailBack)

        }
        else{

        }
    }

    /**
     * 删除邮件回调
     */
    private onClickDeleteMail(){
        let onDeleteMailBack = function(isSucc: boolean){
            if (isSucc) {

            }
        }
        HttpManager.GetInstance().sendHttp_DeleteReadMail(onDeleteMailBack)
    }

}
