module showflake::showflake;
use showflake::registry::Registry;
use showflake::admin::YetiUpgrade;
use std::string::String;


public struct Yeti has key, store {
    id: UID,
    image_url: String,
    level: u64
}

public fun mint(ctx: &mut TxContext): Yeti {
    Yeti {
        id: object::new(ctx),
        image_url: b"https://example.com".to_string(),
        level: 1
    }
}

public fun mint_v2(registry: &mut Registry, ctx: &mut TxContext): Yeti {
    assert!(!registry.contains(ctx.sender()), 0);

    registry.add_entry(ctx.sender());
    mint(ctx)
}

public fun upgrade_yeti(yeti: &mut Yeti, yeti_upgrade: YetiUpgrade) {
    assert!(yeti.level <= yeti_upgrade.level(), 0); // if yeti level is lower
    
    let (image_url, level) = yeti_upgrade.destruct_yeti_upgrade();
    yeti.level = level;
    yeti.image_url = image_url;
}


#[ test_only ]
public fun destroy_yeti(object: Yeti) {
    let Yeti { id, .. } = object;

    id.delete()
}
//public fun upgrade_yeti_by_objects(yeti: &mut Yeti, yeti_upgrades: vector<YetiUpgrade>) {
//    let highest_yeti_level = find_higher_upgrade(yeti_upgrades);

//    upgrade_yeti(yeti, highest_yeti_level);
//}


// helpers 
//fun find_higher_upgrade(mut yeti_upgrades: vector<YetiUpgrade>): YetiUpgrade {
//    assert!(yeti_upgrades.length() != 0, 0); // error in length is zero

//    let size = yeti_upgrades.length();
//    let mut i = 0;
//    let mut highest_level_index = 0;
//    let mut highest_level = 0;

//    // pick the upgrade with the highest `yeti_upgrade.level` number
//    while (i < size) {
//        let level = yeti_upgrades[i].level();

//        if (level > highest_level) {
//            highest_level = level;
//            highest_level_index = i;
//        };
//        i = i + 1
//    };

//    let yeti_upgrade =  yeti_upgrades.remove(highest_level_index);

//    // delete the rest
//    clean_up(yeti_upgrades);
    
//    yeti_upgrade  
//}

// fun clean_up(mut yeti_upgrades: vector<YetiUpgrade>) {
    // loop through
//    loop {
//        if (yeti_upgrades.length() == 0) break;
//        let yeti_upgrade = yeti_upgrades.pop_back();
//        yeti_upgrade.destruct_yeti_upgrade();
//    };
//}