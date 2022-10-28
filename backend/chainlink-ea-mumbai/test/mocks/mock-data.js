const CORRECT_SIGNATURE = '0X29E';
const INCORRECT_SIGNATURE = '0X29F';
const userData = {
  username: 'TwitterDev',
  id: '2244994945',
  name: 'Twitter Dev',
};

const mockResponseWithSignature = () => {
  return {
    data: {
      data: [
        {
          text: 'This is a mock tweet',
        },
        {
          text: CORRECT_SIGNATURE,
        },
      ],
      username: userData.username,
      id: userData.id,
      name: userData.name,
    },
  };
};

const mockResponseWithoutSignature = () => {
  return {
    data: {
      data: [
        {
          text: 'This is a mock tweet',
        },
        {
          text: 'This is another mock tweet',
        },
      ],
      username: userData.username,
      id: userData.id,
      name: userData.name,
    },
  };
};

module.exports = {
  CORRECT_SIGNATURE,
  INCORRECT_SIGNATURE,
  mockResponseWithSignature,
  mockResponseWithoutSignature,
};
