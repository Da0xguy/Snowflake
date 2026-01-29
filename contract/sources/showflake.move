module showflake::showflake;
use showflake::registry::Registry;
use showflake::admin::YetiUpgrade;
use std::string::String;


public struct Yeti has key {
    id: UID,
    image_url: String,
    level: u64
}

fun create(ctx: &mut TxContext): Yeti {
    Yeti {
        id: object::new(ctx),
        image_url: b"https://example.com".to_string(),
        level: 1
    }
}

public fun mint(registry: &mut Registry, ctx: &mut TxContext): Yeti {
    assert!(!registry.contains(ctx.sender()), 0);

    registry.add_entry(ctx.sender());
    create(ctx)
}

public fun mint_and_send(registry: &mut Registry, recipient: address, ctx: &mut TxContext ) {
    let yeti = mint(registry, ctx);
    transfer::transfer(yeti, recipient)
}

public fun upgrade_yeti(yeti: &mut Yeti, yeti_upgrade: YetiUpgrade) {
    assert!(yeti.level <= yeti_upgrade.level(), 0); // if yeti level is lower
    
    let (image_url, level) = yeti_upgrade.destruct_yeti_upgrade();
    yeti.level = level;
    yeti.image_url = image_url;
}


#[test_only]
public fun destroy_yeti(object: Yeti) {
    let Yeti { id, .. } = object;

    id.delete()
}

#[test_only]
public fun mint_for_testing(ctx: &mut TxContext): Yeti {
    create(ctx)
}
