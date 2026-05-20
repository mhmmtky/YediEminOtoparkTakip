import * as Crypto from "expo-crypto";

export const hashPassword = async (password) => {
  const hashedPassword = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password,
  );
  return hashedPassword;
};
