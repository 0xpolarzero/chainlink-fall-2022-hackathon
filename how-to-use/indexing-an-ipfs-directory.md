---
description: How to pin the IPFS directory of a promise?
---

# Indexing an IPFS directory

Each promise, provided with a valid IPFS CID, displays the current indexing status of the IPFS directory it points to. Everyone can copy this CID, and proceeds to indexing it. Contributing to the network in such ways ensures that this content will be persistent - for as long as it is indexed by peers.

<figure><img src="../.gitbook/assets/image (4).png" alt="The popup shown to disclose how many peers are pinning the content"><figcaption><p>The status of the IPFS content (pins &#x26; deals with Filecoin).</p></figcaption></figure>

## How to set up an IPFS Node?&#x20;

There are multiple ways to set up an IPFS node, and start indexing content, including:

* from the command-line
* using a native browser built-in node (e.g. Brave)
* using IPFS Desktop

The complexity varies depending on the option. [This guide](https://docs.ipfs.tech/how-to/companion-node-types/) is a great way for exploring available methods, while we will only introduce the last one of this list (IPFS Desktop). It is probably the easiest method to deal with, as it installs and manages the local node for you, as well as offering a helpful user interface for managing it.

### Installing IPFS Desktop

1. Navigate to [the `releases` page of the IPFS Desktop Github repository](https://github.com/ipfs/ipfs-desktop/releases/).
2. Download the latest version corresponding to your operating system ([follow this link if you're not sure about the package you need to download](https://github.com/ipfs/ipfs-desktop#install)).
3. Follow the usual install process.

## Pinning content with IPFS Desktop

Once IPFS Desktop installed, open it and wait until it completes the initial setup process. Then, you can start pinning your first IPFS file/folder.

The following steps can be followed to pin the content of a promise. This way, you can be confident that **as long as you keep your node running, and this content pinned, it won't ever disappear from the network**.

1.  Hover on the IPFS CID in the promise, and copy it from the popup&#x20;

    <figure><img src="../.gitbook/assets/image (14).png" alt="The IPFS CID showing in a popup from the promise"><figcaption><p>Copy the IPFS CID from the promise.</p></figcaption></figure>


2.  Go to the **Files** tab **->** click **Import ->** click **From IPFS**.

    <figure><img src="../.gitbook/assets/image (6).png" alt="The steps to follow to import a file from IPFS"><figcaption><p>Click <strong>Files</strong> -> <strong>Import</strong> -> <strong>From IPFS</strong>.</p></figcaption></figure>


3.  In the pop-up, paste the CID, give it a name if you want, then click **Import**.

    <figure><img src="../.gitbook/assets/image (9).png" alt="The pop-up that is displayed after clicking Import"><figcaption><p>Add the IPFS CID, a name, and click <strong>Import</strong>.</p></figcaption></figure>


4.  Once the content imported, you should make sure you are actually pinning it ; it will ensure it is not deleted during [garbage collection](https://docs.ipfs.tech/concepts/persistence/#garbage-collection). To do so, click the <img src="../.gitbook/assets/ellipsis-solid.svg" alt="" data-size="line">, then **Set pinning**.

    <figure><img src="../.gitbook/assets/image.png" alt=""><figcaption><p>Click the ellipsis, then <strong>Set pinning</strong>.</p></figcaption></figure>


5.  Make sure **Local node** is checked, then click **Apply**.

    <figure><img src="../.gitbook/assets/image (5).png" alt="The pop-up shown when checking the pinning status"><figcaption><p>Check <strong>Local node</strong>, then <strong>Apply</strong>.</p></figcaption></figure>


6. That's it! Enjoy the comfort of knowing that the content of this promise will not disappear. You don't need to _trust_ anyone - you actually _know_ that it will stay persistent and immutable, for as long as you keep it pinned with your node.

## Resources

|                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------- |
| [Web3 Storage](https://web3.storage/)                                                                                                        |
| [Getting started with IPFS & Filecoin](https://ecosystem-wg.notion.site/Getting-Started-With-IPFS-Filecoin-c00526cf97ba4087ba5c3ad5f5337a58) |
| [IPFS Documentation - What is IPFS?](https://docs.ipfs.tech/concepts/what-is-ipfs/)                                                          |
| [IPFS Documentation - Immutability](https://docs.ipfs.tech/concepts/immutability/)                                                           |
| [IPFS Documentation - Node types](https://docs.ipfs.tech/how-to/companion-node-types/#external)                                              |

