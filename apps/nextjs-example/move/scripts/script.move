script {
    use cedra_framework::cedra_account;

    fun main(caller: &signer, receiver: address, amount: u64) {
        cedra_account::transfer(caller, receiver, amount);
    }
}