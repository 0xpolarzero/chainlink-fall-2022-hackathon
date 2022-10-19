export default function ContractCard({contractAttributes}) {
    const {agreementName, owner, contractAddress, pdfUri, partyNames, partyTwitterHandles, partyAddresses} = contractAttributes;

    return (
        <div className={styles.contractCard}>{agreementName}</div>
}