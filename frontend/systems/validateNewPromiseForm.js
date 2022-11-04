import { toast } from 'react-toastify';

const validateNewPromiseForm = async (form) => {
  const formValues = await form.validateFields().catch((err) => {
    console.log(err);
    toast.error('Please fill all the fields correctly.');
    return false;
  });

  if (formValues) {
    // Gather names, addresses and Twitter usernames
    const partyNameArray = Object.values(formValues.parties).map(
      (field) => field.partyName,
    );
    const partyAddressArray = Object.values(formValues.parties).map((field) =>
      field.partyAddress.toLowerCase(),
    );
    const partyTwitterHandleArray = Object.values(formValues.parties).map(
      (field) => {
        // Make sure to fill the array with empty strings if no Twitter handle is provided
        if (field.partyTwitterHandle) {
          return field.partyTwitterHandle.replace('@', '').toLowerCase();
        } else {
          return '';
        }
      },
    );

    // Check if there is no dupplicate address or Twitter handle
    const addressSet = new Set(partyAddressArray);
    const twitterHandleSet = new Set(partyTwitterHandleArray);

    if (addressSet.size !== partyAddressArray.length) {
      toast.error('There are duplicate addresses.');
      return false;
    } else if (twitterHandleSet.size !== partyTwitterHandleArray.length) {
      toast.error('There are duplicate Twitter handles.');
      return false;
    }

    console.log(formValues.upload);
    // Make sure at least a file has been dropped
    if (!formValues.upload || formValues.upload.length < 1) {
      toast.error('Please upload at least a file.');
      return false;
    }

    const promiseName = formValues.promiseName;
    const files = formValues.upload;

    return {
      promiseName,
      partyNameArray,
      partyAddressArray,
      partyTwitterHandleArray,
      files,
    };
  } else {
    return false;
  }
};

export { validateNewPromiseForm };
