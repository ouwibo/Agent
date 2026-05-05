const { ClawCredit } = require('@t54-labs/clawcredit-sdk');

(async () => {
  const credit = new ClawCredit({ agentName: 'ouwibo-agent' });

  const result = await credit.register({
    inviteCode: 'CLAW-EA10-MWRZ',
    runtimeEnv: 'node-v22',
    model: 'minimax/m2.7'
  });

  console.log(JSON.stringify(result, null, 2));
})();