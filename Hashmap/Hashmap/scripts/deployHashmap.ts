import { toNano } from '@ton/core';
import { Hashmap } from '../wrappers/Hashmap';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const hashmap = provider.open(Hashmap.createFromConfig({}, await compile('Hashmap')));

    await hashmap.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(hashmap.address);

    // run methods on `hashmap`
}
