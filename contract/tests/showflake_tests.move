#[test_only]
module showflake::showflake_tests;
use showflake::showflake;
use showflake::admin;
use showflake::registry;
use showflake::showflake::Yeti;

#[error(code = 0)]
const ENotImplemented: vector<u8> = b"Not Implemented";

const ADMIN: address = @0xAD;
const SENDER: address = @0x123;



#[test]
fun test_minting() {
    let ctx = &mut tx_context::dummy();
    showflake::mint_for_testing(ctx).destroy_yeti();
}

#[test]
fun test_upgrade() {
    let ctx = &mut tx_context::dummy();
    registry::init_for_testing(ctx);
    let admin_cap = admin::mint_admin(ctx);
    let mut yeti = showflake::mint_for_testing(ctx);
    let upgrade = admin::mint(&admin_cap, b"Test_url".to_string(), 4,ctx);

    showflake::upgrade_yeti(&mut yeti, upgrade);

    // clean up
    yeti.destroy_yeti();
    admin_cap.destroy();
}


#[test, expected_failure(abort_code = 0)]
fun test_upgrade_downgrade_fail() {
    let ctx = &mut tx_context::dummy();
    registry::init_for_testing(ctx);
    let admin_cap = admin::mint_admin(ctx);
    let mut yeti = showflake::mint_for_testing(ctx);

    // apply a higher level upgrade first
    let upgrade_high = admin::mint(&admin_cap, b"High".to_string(), 5, ctx);
    showflake::upgrade_yeti(&mut yeti, upgrade_high);

    // attempt to apply a lower-level upgrade -> should abort (assert in contract uses code 0)
    let downgrade = admin::mint(&admin_cap, b"Low".to_string(), 2, ctx);
    showflake::upgrade_yeti(&mut yeti, downgrade);

    // cleanup (not reached on abort)
    yeti.destroy_yeti();
    admin_cap.destroy();
}

#[test, expected_failure(abort_code = 0)]
fun test_only_one_nft_per_address() {
    let ctx = &mut tx_context::dummy();
    let mut registry = registry::registry_for_testing(ctx);

    // first mint should succeed
    let first = showflake::mint(&mut registry, ctx);

    // second mint from same context/address should fail (registry enforces one NFT per address)
    let second = showflake::mint(&mut registry, ctx);

    // cleanup (not reached on abort)
    first.destroy_yeti();
    second.destroy_yeti();
    registry.destroy();
}

