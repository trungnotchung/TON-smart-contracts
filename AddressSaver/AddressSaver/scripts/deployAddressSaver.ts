import { toNano } from '@ton/core';
import { AddressSaver } from '../wrappers/AddressSaver';
import { compile, NetworkProvider } from '@ton/blueprint';
import { randomAddress } from '@ton/test-utils';

export async function run(provider: NetworkProvider) {
    const address1 = randomAddress();
    const address2 = randomAddress();

    const addressSaver = provider.open(AddressSaver.createFromConfig({manager: provider.sender().address!, employee: address2}, await compile('AddressSaver')));

    await addressSaver.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(addressSaver.address);

    // run methods on `addressSaver`
}
