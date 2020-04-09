/*
*   音频管理
*   2020/3/17
*/

const { ccclass, property } = cc._decorator

@ccclass
export class AudioManager extends cc.Component {

    public musicEnabled: boolean = true;
    public effectsEnabled: boolean = true;
    private musicName: string = "";
    private effectName: string = "";
    private soundMap: { [key: string]: any } = {};
    private static Instance: AudioManager = null;

    public static GetInstance(): AudioManager {
        if (this.Instance == null) {
            this.Instance = new AudioManager();
        }
        return this.Instance;
    }

    private addAudio(key: string, clip: cc.AudioClip): void {
        this.soundMap[key] = clip
    }

    public loadAudio(audioUrl: string): void {
        cc.loader.loadResDir(audioUrl, cc.AudioClip, function (err, clips) {
            for (let i = 0; i < clips.length; i++) {
                AudioManager.GetInstance().addAudio(clips[i].name, clips[i])
            }
        });
    }

    public playMusic(musicName: string, loop: boolean = true): void {
        if (musicName == "") {
            cc.log("musicName is not found")
            return
        }
        this.musicName = musicName;
        cc.audioEngine.playMusic(this.soundMap[this.musicName], loop)
    }

    public playEffect(effectName: string, loop: boolean = false): void {
        if (effectName == "") {
            cc.log("effectName is not found")
            return
        }
        this.effectName = effectName;
        cc.audioEngine.playEffect(this.soundMap[this.effectName], loop)
    }

    public setMusicVolume(musicVolume: number): void {
        let curMusicVolume = cc.audioEngine.getMusicVolume();
        if (curMusicVolume === musicVolume || !this.musicEnabled) {
            return
        }
        cc.audioEngine.setMusicVolume(musicVolume)
    }

    public setEffecstVolume(effectsVolume: number): void {
        let curEffectsVolume = cc.audioEngine.getEffectsVolume();
        if (curEffectsVolume === effectsVolume || !this.effectsEnabled) {
            return
        }
        cc.audioEngine.setEffectsVolume(effectsVolume)
    }

    public stopMusic(): void {
        cc.audioEngine.stopMusic()
    }

    public stopAllEffects(): void {
        cc.audioEngine.stopAllEffects()
    }

    public setMusicEnabled(enabled: boolean): void {
        if (!enabled){
            cc.audioEngine.setMusicVolume(0);
        }else{
            cc.audioEngine.setMusicVolume(1.0)
        }
        this.musicEnabled = enabled;
    }

    public setEffectscEnabled(enabled: boolean): void {
        if (!enabled){
            cc.audioEngine.setEffectsVolume(0);
        }else{
            cc.audioEngine.setEffectsVolume(1.0);
        }
        this.effectsEnabled = enabled;
    }

}