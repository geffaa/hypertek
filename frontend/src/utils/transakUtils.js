/**
 * Opens the Transak on-ramp widget in a popup.
 * Used in NFT buy flow and Withdraw page.
 *
 * @param {object} options
 * @param {string} options.walletAddress  - User's wallet address to receive crypto
 * @param {string} [options.fiatAmount]   - Pre-fill fiat amount (e.g. "25")
 * @param {string} [options.network]      - e.g. "base" (default: no network pre-fill)
 */
export const openTransakOnRamp = ({ walletAddress, fiatAmount, network } = {}) => {
  const apiKey = import.meta.env.VITE_TRANSAK_API_KEY;
  const isStaging = (import.meta.env.VITE_TRANSAK_ENVIRONMENT || "STAGING").toUpperCase() === "STAGING";

  const params = new URLSearchParams({
    productsAvailed: "BUY",
    cryptoCurrencyCode: "USDC",
    defaultFiatCurrency: "USD",
    themeColor: "002AA8",
  });

  if (apiKey) {
    params.set("apiKey", apiKey);
    params.set("environment", isStaging ? "STAGING" : "PRODUCTION");
  }
  if (walletAddress) params.set("walletAddress", walletAddress);
  if (fiatAmount) params.set("defaultFiatAmount", fiatAmount);
  if (network) params.set("network", network);

  const baseUrl = isStaging ? "https://global-stg.transak.com/" : "https://global.transak.com/";
  const url = `${baseUrl}?${params.toString()}`;

  const w = 460, h = 700;
  const left = Math.round(window.screenX + (window.outerWidth - w) / 2);
  const top = Math.round(window.screenY + (window.outerHeight - h) / 2);
  window.open(url, "transak_buy", `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`);
};

/**
 * Opens the Transak off-ramp (sell/withdraw) widget.
 */
export const openTransakOffRamp = ({ walletAddress } = {}) => {
  const apiKey = import.meta.env.VITE_TRANSAK_API_KEY;
  const isStaging = (import.meta.env.VITE_TRANSAK_ENVIRONMENT || "STAGING").toUpperCase() === "STAGING";

  const params = new URLSearchParams({
    productsAvailed: "SELL",
    cryptoCurrencyCode: "USDC",
    defaultFiatCurrency: "USD",
    themeColor: "002AA8",
  });

  if (apiKey) {
    params.set("apiKey", apiKey);
    params.set("environment", isStaging ? "STAGING" : "PRODUCTION");
  }
  if (walletAddress) params.set("walletAddress", walletAddress);

  const baseUrl = isStaging ? "https://global-stg.transak.com/" : "https://global.transak.com/";
  const url = `${baseUrl}?${params.toString()}`;

  const w = 460, h = 700;
  const left = Math.round(window.screenX + (window.outerWidth - w) / 2);
  const top = Math.round(window.screenY + (window.outerHeight - h) / 2);
  window.open(url, "transak_sell", `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`);
};
