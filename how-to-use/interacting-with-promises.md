---
description: How to interact with your promises?
---

# Interacting with promises

<figure><img src="../.gitbook/assets/image (10).png" alt="Using the menu to navigate to the dashboard"><figcaption><p>Go to the dashboard from the menu.</p></figcaption></figure>

The dashboard shows different sections to interact with the App:

* the promises you created ;
* the promises you're involved with, meaning that you've been added as a participant ;
* the Twitter handles you have verified.

Clicking on a promise, from the first two sections, will open a drawer through which you can interact with this promise's contract.

{% hint style="info" %}
Any interaction with a promise is only available to participants in that specific promise.

It will always trigger a transaction, that requires the user to approve and pay some gas for it to go through.
{% endhint %}

<figure><img src="../.gitbook/assets/image (5).png" alt="Clicking on a promise will open a popup"><figcaption><p>Click on a promise to start interacting with it.</p></figcaption></figure>

<figure><img src="../.gitbook/assets/image (9).png" alt="The drawer used for interacting with a promise"><figcaption><p>The drawer for interacting with a promise.</p></figcaption></figure>

Opening the drawer will display, at the top, the same table as for the promises in the **Explore promises** page ; only omitting to list the IPFS directory [#what-does-a-promise-look-like](../introduction/exploring-promises.md#what-does-a-promise-look-like "mention").

Below are the various ways of interacting with the promise, also available directly from the contract.

<details>

<summary>Add a participant</summary>

This button allows anyone involved in the promise to add new members to participate. They will inherit the same permissions as the initial participants. If any had already approved the promise, this approval will be reset, and they will need to approve it again.

</details>

<details>

<summary>Approve promise</summary>

Approving the promise shows that each member is indeed participating in that agreement, and is not an arbitrarily included Ethereum address. Only a participant can approve for themselves.

Any time a participant is added, everyone needs to approve the promise again. This is done, so they can approve it, knowing exactly what they agree to, and with whom.

</details>

<figure><img src="../.gitbook/assets/image (8).png" alt="The popup shown for adding a new participant to the promise"><figcaption><p>The popup shown for adding a participant.</p></figcaption></figure>

<details>

<summary>Verify Twitter</summary>

This section allows any participant with a Twitter handle attached to this promise, to ensure that they actually own it.

Please visit [verifying-a-twitter-handle.md](../introduction/verifying-a-twitter-handle.md "mention") for the detailed steps.

</details>

<details>

<summary>Lock promise</summary>

Once all the participants have approved the promise, it can then be locked. That means it will no longer be possible to add new participants.

This **Locked** status is a proof of reliability for your promise, as it means that it can't be modified anymore. Additionally, it means that all participants have confirmed they own their Ethereum address, and indeed agreed to participating in that promise.

</details>
