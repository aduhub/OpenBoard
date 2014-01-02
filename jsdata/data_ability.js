//辞書
function Dic(key){
	var r = "";
	switch(true){
	case /@AID@/.test(key):
		r = "加勢";
		break;
	case /@ADAPTATION@/.test(key):
		r = "順応";
		break;
	case /@ALCHEMY@/.test(key):
		r = "◆錬金";
		break;
	case /@BAND@/.test(key):
		r = "援護";
		break;
	case /@BIND@/.test(key):
		r = "麻痺";
		break;
	case /@BLACKSWAN@/.test(key):
		r = "報酬";
		break;
	case /@CLEAR@/.test(key):
		r = "浄化";
		break;
	case /@COLLAPSE@/.test(key):
		r = "自壊";
		break;
	case /@COUNTER@/.test(key):
		r = "反撃";
		break;
	case /@CURSEDMG@/.test(key):
		r = "呪術";
		break;
	case /@DEATH@/.test(key):
		r = "即死";
		break;
	case /@DEFBASE@/.test(key):
		r = "防衛";
		break;
	case /@DICE1@/.test(key):
		r = "怨恨";
		break;
	case /@DIRECT@/.test(key):
		r = "貫通";
		break;
	case /@DISCARD@/.test(key):
		r = "破棄";
		break;
	case /@DISPEL@/.test(key):
		r = "◆絶叫";
		break;
	case /@DIVING@/.test(key):
		r = "◆潜水";
		break;
	case /@DIVISION@/.test(key):
		r = "◆分裂";
		break;
	case /@DRUG@/.test(key):
		r = "霊薬";
		break;
	case /@DRAIN@/.test(key):
		r = "◆吸収";
		break;
	case /@DRAWCARD@/.test(key):
		r = "◆補充";
		break;
	case /@EARTHKING/.test(key):
		r = "応援";
		break;
	case /@ESCAPE@/.test(key):
		r = "逃走";
		break;
	case /@FEAR@/.test(key):
		r = "弱打";
		break;
	case /@FENIX@/.test(key):
		r = "◆転生";
		break;
	case /@FIREBALL@/.test(key):
		r = "◆火球";
		break;
	case /@FIRST@/.test(key):
		r = "先制";
		break;
	case /@FLYING@/.test(key):
		r = "飛行";
		break;
	case /@GLIDE@/.test(key):
		r = "◆滑空";
		break;
	case /@GREED@/.test(key):
		r = "強欲";
		break;
	case /@HALFSHIELD@/.test(key):
		r = "頑健";
		break;
	case /@HOMING@/.test(key):
		r = "帰巣";
		break;
	case /@HUNTER@/.test(key):
		r = "名声";
		break;
	case /@IRONHEART@/.test(key):
		r = "根性";
		break;
	case /@LEVELUP@/.test(key):
		r = "◆改築";
		break;
	case /@LFCHANGE@/.test(key):
		r = "LF変更";
		break;
	case /@NIGHTMARE@/.test(key):
		r = "悪夢";
		break;
	case /@POISON@/.test(key):
		r = "猛毒";
		break;
	case /@PUSH@/.test(key):
		r = "◆押出";
		break;
	case /@QUICKSAND@/.test(key):
		r = "◆足止";
		break;
	case /@REFLECT@/.test(key):
		r = "反射";
		break;
	case /@REGENE@/.test(key):
		r = "再生";
		break;
	case /@REMOVE@/.test(key):
		r = "解呪";
		break;
	case /@REWARD@/.test(key):
		r = "改築";
		break;
	case /@RITUAL@/.test(key):
		r = "召還";
		break;
	case /@RUST@/.test(key):
		r = "◆破砕";
		break;
	case /@PHANTASM@/.test(key):
		r = "幻影";
		break;
	case /@PROTECTION@/.test(key):
		r = "無効";
		break;
	case /@SCOUT@/.test(key):
		r = "◇偵察";
		break;
	case /@SHOOT@/.test(key):
		r = "射撃";
		break;
	case /@SINK@/.test(key):
		r = "水没";
		break;
	case /@SLOW@/.test(key):
		r = "\後手";
		break;
	case /@SMASH@/.test(key):
		r = "強打";
		break;
	case /@SPIKESHIELD@/.test(key):
		r = "反射";
		break;
	case /@SPHINX@/.test(key):
		r = "変更";
		break;
	case /@SPY@/.test(key):
		r = "察知";
		break;
	case /@STCHANGE@/.test(key):
		r = "ST変更";
		break;
	case /@STEAL@/.test(key):
		r = "◇奪取";
		break;
	case /@STICKY@/.test(key):
		r = "粘着";
		break;
	case /@STONE@/.test(key):
		r = "石化";
		break;
	case /@SWAP@/.test(key):
		r = "入替";
		break;
	case /@TOUR@/.test(key):
		r = "◆巡回";
		break;
	case /@UNTIELEMENT@/.test(key):
		r = "◆無地";
		break;
	case /@UROBOROS@/.test(key):
		r = "円環";
		break;
	case /@MAP[0-9A-Z]+@/.test(key):
		r = "結界";
		break;
	case /_BANK_/.test(key):
		r = "金貨";
		break;
	case /^_BARRIER_/.test(key):
		r = "保護";
		break;
	case /_BIND_/.test(key):
		r = "麻痺";
		break;
	case /_BALOON_/.test(key):
		r = "風船";
		break;
	case /_CONTRACT_/.test(key):
		r = "契約";
		break;
	case /^_DICE_/.test(key):
		r = "移動";
		break;
	case /^_FORGERY_/.test(key):
		r = "署名";
		break;
	case /^_FORGET_/.test(key):
		r = "忘却";
		break;
	case /^_GATHER_/.test(key):
		r = "収集";
		break;
	case /^_GRAVITY_/.test(key):
		r = "重力";
		break;
	case /_JAIL_/.test(key):
		r = "牢獄";
		break;
	case /^_LINKGATE_/.test(key):
		r = "転送";
		break;
	case /^_MONOPOLY_/.test(key):
		r = "独占";
		break;
	case /^_NAVIGATE_/.test(key):
		r = "移動";
		break;
	case /^_PLAGUE_/.test(key):
		r = "疫病";
		break;
	case /_POISON_/.test(key):
		r = "猛毒";
		break;
	case /^_PRAYER_/.test(key):
		r = "祈祷";
		break;
	case  /_PROTECT_/.test(key):
		r = "保護";
		break;
	case /^_QUEST_/.test(key):
		r = "冒険";
		break;
	case  /_QUICKSAND_/.test(key):
		r = "足止";
		break;
	case  /_RECONSTRUCT_/.test(key):
		r = "変動";
		break;
	case /^_SHORTCUT_/.test(key):
		r = "移動";
		break;
	case /^_SPIRITWALK_/.test(key):
		r = "跳躍";
		break;
	case /^_SWAMP_/.test(key):
		r = "暴落";
		break;
	case /^_TELEGNOSIS_/.test(key):
		r = "啓示";
		break;
	case /^_TELEPATHY_/.test(key):
		r = "伝心";
		break;
	case /^_UNTIELEMENT_/.test(key):
		r = "無地";
		break;
	case /^_WARCRY_/.test(key):
		r = "行軍";
		break;
	default:
		r = key;
		break;
	}
	return r;
}
//
function StatusIcon(key){
	var r = "";
	switch(true){
	//PLAYER
	case /^_BANK_/.test(key):
		r = "popp_gold";
		break;
	case /^_BARRIER_/.test(key):
		r = "popp_barrier";
		break;
	case /^_DICE_/.test(key):
		r = "popp_dice";
		break;
	case /^_FORGERY_/.test(key):
		r = "popp_forgery";
		break;
	case /^_GATHER_/.test(key):
		r = "popp_gather";
		break;
	case /^_MONOPOLY_/.test(key):
		r = "popp_monopoly";
		break;
	case /^_NAVIGATE_/.test(key):
		r = "popp_dice";
		break;
	case /^_PLAGUE_/.test(key):
		r = "popp_poison";
		break;
	case /^_PRAYER_/.test(key):
		r = "popp_prayer";
		break;
	case /^_QUEST_/.test(key):
		r = "popp_quest";
		break;
	case /^_SHORTCUT_/.test(key):
		r = "popp_dice";
		break;
	case /^_TELEGNOSIS_/.test(key):
		r = "popp_telegno";
		break;
	//GRID
	case /^_BIND_/.test(key):
		r = "popg_bind";
		break;
	case /^_CONTRACT_/.test(key):
		r = "popg_contract";
		break;
	case /^_FORGET_/.test(key):
		r = "popg_forget";
		break;
	case /^_GRAVITY_/.test(key):
		r = "popg_gravity";
		break;
	case /^_JAIL_/.test(key):
		r = "popg_jail";
		break;
	case /^_LINKGATE_/.test(key):
		r = "popg_teleport";
		break;
	case /^_POISON_/.test(key):
		r = "popg_poison";
		break;
	case /^_PROTECT_/.test(key):
		r = "popg_protect";
		break;
	case /^_QUICKSAND_/.test(key):
		r = "popg_stop";
		break;
	case /^_RECONSTRUCT_/.test(key):
		r = "popg_uparrow";
		break;
	case /^_SWAMP_/.test(key):
		r = "popg_swamp";
		break;
	case /^_SPIRITWALK_/.test(key):
		r = "popg_spiritwalk";
		break;
	case /^_TELEPATHY_/.test(key):
		r = "popg_telepathy";
		break;
	case /^_UNTIELEMENT_/.test(key):
		r = "popg_untielement";
		break;
	case /^_WARCRY_/.test(key):
		r = "popp_warcry";
		break;
	}
	return r;
}