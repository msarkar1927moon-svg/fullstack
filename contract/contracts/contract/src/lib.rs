#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, Env, Address, Symbol, Vec,
};

#[contracttype]
#[derive(Clone)]
pub struct Subscription {
    pub subscriber: Address,
    pub amount: i128,
    pub interval: u64, // in seconds
    pub last_payment: u64,
}

#[contract]
pub struct SubscriptionContract;

#[contractimpl]
impl SubscriptionContract {

    // Create a new subscription
    pub fn create_subscription(
        env: Env,
        subscriber: Address,
        amount: i128,
        interval: u64,
    ) {
        subscriber.require_auth();

        let current_time = env.ledger().timestamp();

        let sub = Subscription {
            subscriber: subscriber.clone(),
            amount,
            interval,
            last_payment: current_time,
        };

        env.storage().persistent().set(&subscriber, &sub);
    }

    // Pay subscription
    pub fn pay(env: Env, subscriber: Address) {
        subscriber.require_auth();

        let mut sub: Subscription = env
            .storage()
            .persistent()
            .get(&subscriber)
            .expect("Subscription not found");

        let current_time = env.ledger().timestamp();

        if current_time < sub.last_payment + sub.interval {
            panic!("Too early to pay");
        }

        // NOTE: Payment logic (token transfer) should be added here
        // using Soroban token interface

        sub.last_payment = current_time;

        env.storage().persistent().set(&subscriber, &sub);
    }

    // Cancel subscription
    pub fn cancel(env: Env, subscriber: Address) {
        subscriber.require_auth();

        env.storage().persistent().remove(&subscriber);
    }

    // View subscription
    pub fn get_subscription(env: Env, subscriber: Address) -> Subscription {
        env.storage()
            .persistent()
            .get(&subscriber)
            .expect("Subscription not found")
    }
}