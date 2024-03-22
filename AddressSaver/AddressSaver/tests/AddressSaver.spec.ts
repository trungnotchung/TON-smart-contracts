import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, beginCell, toNano } from '@ton/core';
import { AddressSaver } from '../wrappers/AddressSaver';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { randomAddress } from '@ton/test-utils';

describe('AddressSaver', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('AddressSaver');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let addressSaver: SandboxContract<AddressSaver>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');

        addressSaver = blockchain.openContract(AddressSaver.createFromConfig({manager: deployer.address}, code));

        const deployResult = await addressSaver.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: addressSaver.address,
            deploy: true,
            exitCode: 4,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and addressSaver are ready to use
    });

    it('should not change saved address by anyone else', async () => {
        let user = await blockchain.treasury('user');
        const address = randomAddress();
        const result = await addressSaver.sendChangeAddress(
            user.getSender(),
            toNano('0.01'),
            12345n,
            address
        );
    
        expect(result.transactions).toHaveTransaction({
            from: user.address,
            to: addressSaver.address,
            success: false,
            exitCode: 1001
        });
    });

    it('should return required data on `requestAddress` call', async () => {
        const address = randomAddress();
        await addressSaver.sendChangeAddress(
            deployer.getSender(),
            toNano('0.01'),
            12345n,
            address
        );
    
        let user = await blockchain.treasury('user');
        const result = await addressSaver.sendRequestAddress(
            user.getSender(),
            toNano('0.01'),
            12345n
        );
        expect(result.transactions).toHaveTransaction({
            from: addressSaver.address,
            to: user.address,
            body: beginCell()
                .storeUint(3, 32)
                .storeUint(12345n, 64)
                .storeAddress(deployer.address)
                .storeAddress(address)
                .endCell(),
        });
    });

    it('should throw on any other opcode', async () => {
        const result = await deployer.send({
            to: addressSaver.address,
            value: toNano('0.01'),
            body: beginCell().storeUint(5, 32).storeUint(12345n, 64).endCell(),
        });
        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: addressSaver.address,
            exitCode: 3,
        });
    });

});
