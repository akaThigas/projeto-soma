/**
 * Lê o app.json e, só quando SOMA_BASE_URL estiver definida, publica o site
 * dentro de um subcaminho (ex.: /projeto-soma no GitHub Pages).
 * Sem a variável, a configuração fica igual ao app.json.
 */
module.exports = ({ config }) => {
  const baseUrl = process.env.SOMA_BASE_URL;
  if (!baseUrl) return config;
  return {
    ...config,
    experiments: { ...config.experiments, baseUrl },
  };
};
