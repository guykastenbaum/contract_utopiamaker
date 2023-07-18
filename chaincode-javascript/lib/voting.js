// Importar las clases y módulos necesarios
const { Contract } = require('fabric-contract-api');

function validateCommaSeparatedString(str) {
  if (!str.trim()) {
    return false;
  }
  const elements = str.split(',');
  for (let element of elements) {
    element = element.trim();
    if (!/^[a-zA-Z0-9_]+(?:,[a-zA-Z0-9_]+)*$/.test(element)) {
      return false;
    }
  }
  return true;
}

class CustomVotingContract extends Contract {

  // Inicializar la lista de votantes (se ejecuta solo una vez en la creación del contrato)
  async initLedger(ctx) {
    const initialized = await ctx.stub.getState('initialized');
    if (!initialized || initialized.length === 0) {
      await ctx.stub.putState('initialized',JSON.stringify({status:'true'}));
      await ctx.stub.putState('votingCount', JSON.stringify({count:0}));
    } else {
      throw new Error(`Yet the contract was initialized`);
    }
  }

  // Crear una nueva votación con opciones
  async createVoting(ctx,  options, description, password) {
    
    const existingVoting = await ctx.stub.getState(votingId);
    if (existingVoting && existingVoting.length > 0) {
      throw new Error(`Voting  ${votingId} alredy exist.`);
    }
    if(!validateCommaSeparatedString(options)){
      throw new Error(`Wrong format for options`);
    }

    var currentCount = await readState(ctx, 'votingCount');
    const newCount = parseInt(currentCount.count)+1;
    
    const id = 'voting'.concat(currentCount.count);
    const optionsArray = options.split(',');
    var optionsObject = Array.from(new Set(optionsArray)).map(function(item) {
        let x = {};
        x.option = item;
        x.count = 0;
        return x;
    });
    const voting = {
      options: optionsObject,
      description: description,
      voters: [],
      password: password,
      status: true
    };

    await ctx.stub.putState(votingId, JSON.stringify(voting));
    await ctx.stub.putState('userCount', JSON.stringify({count:newCount}));
    return id;
  }

  // Permitir que un votante emita un voto
  async vote(ctx, votingId, voter, selectedOption) {
    var voting = await ctx.stub.getState(votingId);
    if (!voting || existingVoting.length === 0) {
      throw new Error(`Voting ${votingId} doesnt exist.`);
    }
    if (!voting.status) {
        throw new Error(`Voting "${votingId}" closed`);
      }
    const voting = JSON.parse(existingVoting.toString());
    if (voting.voters.includes(voter)) {
      throw new Error(`User ${voter} alredy has voted`);
    }
    if (!voting.options.includes(selectedOption)) {
      throw new Error(`Option "${selectedOption}"is not valid for this voting`);
    }

    voting.voters.push(voter);
    let newVoteCount = voting.options.find(obj =>obj.option===selectedOption).count + 1;
    voting.options.find(obj =>obj.option===selectedOption).count = newVoteCount;
    await ctx.stub.putState(votingId, JSON.stringify(voting));
  }

  async closeVoting(ctx, votingId, password) {
    var voting = await ctx.stub.getState(votingId);
    if (!existingVoting || existingVoting.length === 0) {
      throw new Error(`Voting ${votingId} doesnt exist.`);
    }
    if (!voting.status) {
        throw new Error(`Voting "${votingId}" closed`);
    }
    if(voting.password != password){
        throw new Error(`Wrong password for "${votingId}"`);
    }

    voting.status = false;
    await ctx.stub.putState(votingId, JSON.stringify(voting));
  }

  // Obtener los resultados de una votación
  async getVotingResults(ctx, votingId) {
    var existingVoting = await ctx.stub.getState(votingId);
    if (!existingVoting || existingVoting.length === 0) {
      throw new Error(`Voting ${votingId} doesnt exist`);
    }
    existingVoting.password = "";
    return existingVoting.toString();
  }
}

module.exports = CustomVotingContract;
