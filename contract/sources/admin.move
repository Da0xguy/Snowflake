module showflake::admin;
use std::string::String;

public struct YetiAdmin has key, store {
    id: UID
}

public struct YetiUpgrade has key {
    id: UID,
    image_url: String,
    level: u64
}

fun init(ctx: &mut TxContext) {
    transfer::public_transfer(YetiAdmin { id: object::new(ctx) }, ctx.sender())
}

public fun mint(_: &YetiAdmin, image_url: String, level: u64, ctx: &mut TxContext): YetiUpgrade {
    YetiUpgrade {
        id: object::new(ctx),
        image_url,
        level,
    }
}

public fun mint_and_send(yeti_admin: &YetiAdmin, recipient: address, image_url: String, level: u64, ctx: &mut TxContext) {
    let yeti = mint(yeti_admin, image_url, level, ctx);
    transfer::transfer(yeti, recipient)
}

public fun level(yeti_upgrade: &YetiUpgrade): u64 {
    yeti_upgrade.level
}

public fun destruct_yeti_upgrade(yeti_upgrade: YetiUpgrade): ( String, u64 ) {
    let YetiUpgrade { id, level, image_url } = yeti_upgrade;

    id.delete();
    (image_url, level)
}

#[test_only]
public fun mint_admin(ctx: &mut TxContext): YetiAdmin {
    YetiAdmin { id: object::new(ctx) }
}

#[test_only]
public fun destroy(yeti_admin: YetiAdmin) {
    let YetiAdmin { id } = yeti_admin;
    id.delete()
}