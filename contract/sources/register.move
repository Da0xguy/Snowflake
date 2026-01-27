module showflake::registry;
use sui::dynamic_field as df;

public struct Registry has key, store {
    id: UID
}

fun init(ctx: &mut TxContext) {
    transfer::share_object(Registry { id: object::new(ctx) });
}

public fun contains(registry: &Registry, sender: address): bool {
    // check if dynamic_fields of name `address` exists
    df::exists_(&registry.id, sender)
}

public fun add_entry(registry: &mut Registry, sender: address) {
    assert!(!registry.contains(sender), 0); // error if entry exists

    df::add(&mut registry.id, sender, true);
}

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}

#[test_only]
public fun registry_for_testing(ctx: &mut TxContext): Registry {
    Registry { id: object::new(ctx) }
}

#[test_only]
public fun destroy(r: Registry) {
    let Registry { id } = r;
    id.delete();
}
