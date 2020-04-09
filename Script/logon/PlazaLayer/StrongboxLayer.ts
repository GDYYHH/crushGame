import { UIManager } from "../../framework/ui/UIManager";
import { BaseLayer } from "../../framework/ui/BaseLayer"
import { HttpManager } from "../../framework/network/HttpManager";
import { UtilManager } from "../../framework/common/UtilManager";
import { GlobalUser } from "../../framework/config/GlobalUser";
import { ClientConfig } from "../../framework/config/ClientConfig";

/**
 * [layer] 保险箱界面
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class StrongboxLayer extends BaseLayer {
    @property(cc.Button)
    btn_close: cc.Button = null  //关闭界面
    @property(cc.Button)
    btn_look: cc.Button = null  //余额显示
    @property(cc.Toggle)
    toggle_look: cc.Toggle = null  //余额显示
    @property(cc.Button)
    btn_save: cc.Button = null  //存入界面
    @property(cc.Button)
    btn_fetch: cc.Button = null  //取出界面
    @property(cc.Button)
    btn_saveReset: cc.Button = null  //重置存入金额
    @property(cc.Button)
    btn_saveMax: cc.Button = null  //最大存入金额
    @property(cc.Button)
    btn_saveSure: cc.Button = null  //确定存入
    @property(cc.Button)
    btn_fetchReset: cc.Button = null  //重置取出金额
    @property(cc.Button)
    btn_fetchMax: cc.Button = null  //最大取出金额
    @property(cc.Button)
    btn_fetchSure: cc.Button = null  //确定取出
    @property(cc.EditBox)
    edit_inputSave: cc.EditBox = null  //存入金额输入框
    @property(cc.EditBox)
    edit_inputFetch: cc.EditBox = null  //取出金额输入框
    @property(cc.EditBox)
    edit_inputPassword: cc.EditBox = null  //保险箱密码输入框
    @property(cc.Slider)
    slider_save: cc.Slider = null  //存入金额滑动条
    @property(cc.ProgressBar)
    progressBar_save: cc.ProgressBar = null  //存入金额进度条
    @property(cc.Slider)
    slider_fetch: cc.Slider = null  //取出金额滑动条
    @property(cc.ProgressBar)
    progressBar_fetch: cc.ProgressBar = null  //取出金额进度条
    @property(cc.Node)
    node_total: cc.Node = null  //总金额界面
    @property(cc.Node)
    node_save: cc.Node = null  //存入界面
    @property(cc.Node)
    node_fetch: cc.Node = null  //取出界面
    @property(cc.ScrollView)
    scrollView_record: cc.ScrollView = null  //收益记录
    @property(cc.Node)
    node_recordItem: cc.Node = null  //收益记录item
    @property(cc.Label)
    t_goldNum: cc.Label = null  //总金额
    @property(cc.Label)
    t_earnTotal: cc.Label = null  //累计收益
    @property(cc.Label)
    t_rateTotal: cc.Label = null  //七日年化
    @property(cc.Label)
    save_t_boxTotal: cc.Label = null  //存-携带
    @property(cc.Label)
    save_t_useTotal: cc.Label = null  //存-银行
    @property(cc.Label)
    fetch_t_boxTotal: cc.Label = null  //转-携带
    @property(cc.Label)
    fetch_t_useTotal: cc.Label = null  //转-银行
    @property(cc.Node)
    node_desc: cc.Node = null  //无收益描述

    private isLook = false //是否显示余额

    public onLoad() {

        this.initUI()

        this.btn_close.node.on('click', () => {
            let isShow = this.isSaveFetchShow();
            if (isShow) {
                this.node_total.active = true;
                this.node_save.active = false;
                this.node_fetch.active = false;
            } else {
                UIManager.GetInstance().hide("StrongboxLayer");
            }
        })
        //可见性
        this.btn_look.node.on('click', () => {
            this.refreshData()
        })
        //存入
        this.btn_save.node.on('click', () => {
            this.node_total.active = false;
            this.node_save.active = true;
            this.node_fetch.active = false;
        })
        //转出
        this.btn_fetch.node.on('click', () => {
            this.node_total.active = false;
            this.node_save.active = false;
            this.node_fetch.active = true;
        })
        //重置存入
        this.btn_saveReset.node.on('click', () => {
            this.edit_inputSave.string = "";
            this.slider_save.progress = 0;
            this.progressBar_save.progress = 0;
        })
        //最大存入
        this.btn_saveMax.node.on('click', () => {
            let maxScore = UtilManager.fixed(GlobalUser.user_goldScore);
            this.edit_inputSave.string = maxScore;
            this.slider_save.progress = 1;
            this.progressBar_save.progress = 1;
        })
        //重置转出
        this.btn_fetchReset.node.on('click', () => {
            this.edit_inputFetch.string = "";
            this.edit_inputPassword.string = "";
            this.slider_fetch.progress = 0;
            this.progressBar_fetch.progress = 0;
        })
        //最大转出
        this.btn_fetchMax.node.on('click', () => {
            let maxScore = UtilManager.fixed(GlobalUser.user_bankScore);
            this.edit_inputFetch.string = maxScore;
            this.slider_fetch.progress = 1;
            this.progressBar_fetch.progress = 1;
        })
    }

    public start() {
        this.refreshData();
        HttpManager.GetInstance().sendHttp_YEBRecord((success: boolean, data: any) => {
            if (success) {
                this.refreshScrollView(data);
            } else {
                UIManager.GetInstance().showToast("未获取到余额宝信息", 1);
            }
        })
    }

    // update (dt) {}

    //界面初始化
    public initUI(): void {
        this.node_total.active = true;
        this.node_save.active = false;
        this.node_fetch.active = false;
        this.node_desc.active = false;

        this.slider_save.progress = 0;
        this.progressBar_save.progress = 0;
        this.slider_fetch.progress = 0;
        this.progressBar_fetch.progress = 0;
    }

    //存入滑动事件
    public sliderSaveEvent(sender, eventType): void {
        let saveScore = UtilManager.fixed(GlobalUser.user_goldScore * sender.progress);
        this.edit_inputSave.string = saveScore
        this.progressBar_save.progress = sender.progress;
    }

    //转出滑动事件
    public sliderFetchEvent(sender, eventType): void {
        let fetchScore = UtilManager.fixed(GlobalUser.user_bankScore * sender.progress);
        this.edit_inputFetch.string = fetchScore
        this.progressBar_fetch.progress = sender.progress;
    }

    //刷新收益列表
    public refreshScrollView(data: any): void {
        let rows = data["Rows"];

        if (rows.length == 0) {
            this.node_desc.active = true;
            return;
        }

        let onItemCallback = (item: cc.Node, data: any, index: number) => {

            let t_type = item.getChildByName("t_type").getComponent(cc.Label);//类型
            let t_earn = item.getChildByName("t_earn").getComponent(cc.Label);//收益
            let t_earnTotal = item.getChildByName("t_earnTotal").getComponent(cc.Label);//余额
            let t_date = item.getChildByName("t_date").getComponent(cc.Label);//日期

            let rowArr = this.updateRows(data);

            t_type.string = rowArr[0];
            t_earn.string = rowArr[1];
            t_earnTotal.string = rowArr[2]
            t_date.string = rowArr[3];
        }

        UtilManager.GetInstance().initScrollView(rows, onItemCallback, this.scrollView_record, this.node_recordItem, 10)

        this.node_desc.active = false;
    }

    //获取收益类型
    public updateRows(row: any): Array<any> {

        let rowArr = []

        switch (row.TradeType) {
            case 1:
                rowArr[0] = "存入";
                rowArr[1] = "+" + UtilManager.fixed(row.SwapScore);
                break
            case 2:
                rowArr[0] = "转出";
                rowArr[1] = "-" + UtilManager.fixed(row.SwapScore);
                break
            case 3:
                rowArr[0] = "赠送";
                rowArr[1] = "+" + UtilManager.fixed(row.SwapScore);
                break
            case 4:
                rowArr[0] = "收益";
                rowArr[1] = "+" + UtilManager.fixed(row.SwapScore);
                break
            default:
                rowArr[0] = "转入";
                rowArr[1] = "+" + UtilManager.fixed(row.SwapScore);
                break
        }
        rowArr[2] = UtilManager.fixed(row.TargetBank);
        rowArr[3] = row.CollectDate;

        return rowArr;
    }

    //刷新数据
    public refreshData(): void {
        let gold = UtilManager.fixed(GlobalUser.user_goldScore);
        let bankGold = UtilManager.fixed(GlobalUser.user_bankScore);
        let earn = UtilManager.fixed(GlobalUser.user_cumulative);
        let rate = UtilManager.string(ClientConfig.bankRate);

        this.isLook = this.toggle_look.isChecked
        if (this.isLook) {
            this.t_goldNum.string = "****";
            this.t_earnTotal.string = "****";
        } else {
            this.t_goldNum.string = bankGold;
            this.t_earnTotal.string = earn;
        }
        this.t_rateTotal.string = rate;

        this.save_t_boxTotal.string = gold;
        this.save_t_useTotal.string = bankGold;

        this.fetch_t_boxTotal.string = gold;
        this.fetch_t_useTotal.string = bankGold;
    }

    //是否在存转界面
    public isSaveFetchShow(): boolean {
        let active = this.node_save.active == true || this.node_fetch.active == true;
        return active;
    }
}
