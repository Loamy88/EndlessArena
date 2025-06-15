// shop.js (Updated Shop System with Visuals, Reroll, Stat Panel, and Restrictions)

function showShop() {
  shopEl.style.display = 'block';
  upgradeSlots.innerHTML = '';

  const options = [];
  const upgradeTypes = [
    { type: 'health', weight: 5 },
    { type: 'speed', weight: 5 },
    { type: 'newAbility', weight: 2 },
    { type: 'upgradeAbility', weight: 4 }
  ];

  // Weighted random selection
  function weightedRandom(list) {
    let total = list.reduce((sum, obj) => sum + obj.weight, 0);
    let rand = Math.random() * total;
    for (let obj of list) {
      if (rand < obj.weight) return obj.type;
      rand -= obj.weight;
    }
  }

  // Abilities and their weights
  const abilityPool = [
    { type: 'lifeSteal', weight: 2 },
    { type: 'projectiles', weight: 3 },
    { type: 'energyRing', weight: 2 },
    { type: 'lightning', weight: 1 }
  ];

  // Get a new ability player doesn't have
  function getNewAbility() {
    const available = abilityPool.filter(a => !abilities[a.type]);
    return available.length ? weightedRandom(available) : null;
  }

  // Generate three upgrade slots
  let generated = 0;
  while (generated < 3) {
    const classType = weightedRandom(upgradeTypes);
    let upgrade = { classType, cost: rand(5, 12), desc: '', action: () => {} };

    switch (classType) {
      case 'health':
        if (Math.random() < 0.5) {
          const amount = rand(10, 30);
          upgrade.desc = `Heal +${amount}`;
          upgrade.action = () => player.health = Math.min(player.maxHealth, player.health + amount);
        } else {
          const amount = rand(10, 30);
          upgrade.desc = `Max Health +${amount}`;
          upgrade.action = () => {
            player.maxHealth += amount;
            stats.maxHealth = player.maxHealth;
          };
        }
        break;

      case 'speed':
        const speedBoost = +(Math.random() * 0.6 + 0.2).toFixed(1);
        upgrade.desc = `Speed +${speedBoost}`;
        upgrade.action = () => {
          stats.speed += speedBoost;
          player.speed = stats.speed;
        };
        break;

      case 'newAbility':
        const newAbility = getNewAbility();
        if (!newAbility) continue;
        abilities[newAbility] = { level: 1 };
        upgrade.desc = `New Ability: ${newAbility}`;
        upgrade.action = () => {}; // Already applied
        break;

      case 'upgradeAbility':
        const upgradable = Object.keys(abilities).filter(k => k !== 'melee');
        if (upgradable.length === 0) continue;
        const upgradeTarget = upgradable[rand(0, upgradable.length - 1)];
        upgrade.desc = `Upgrade: ${upgradeTarget}`;
        upgrade.action = () => abilities[upgradeTarget].level++;
        break;
    }

    const slot = document.createElement('div');
    slot.className = 'upgrade';
    slot.innerHTML = `<p>${upgrade.desc}</p><p>Cost: ${upgrade.cost}g</p>`;

    slot.addEventListener('click', () => {
      if (gold >= upgrade.cost && !slot.classList.contains('used')) {
        gold -= upgrade.cost;
        upgrade.action();
        slot.classList.add('used');
        slot.style.opacity = 0.5;
        slot.innerHTML += `<div class="strikeout"></div>`;
        updateStatsPanel();
      }
    });

    upgradeSlots.appendChild(slot);
    generated++;
  }

  updateStatsPanel();
}

// Displays current player stats and abilities
function updateStatsPanel() {
  statsEl.innerHTML = `
    <h3>Stats</h3>
    <p>Health: ${Math.floor(player.health)} / ${Math.floor(player.maxHealth)}</p>
    <p>Speed: ${stats.speed.toFixed(1)}</p>
    <p>Gold: ${gold}</p>
    <p>Wave: ${wave}</p>
    <h4>Abilities</h4>
    <ul>
      ${Object.keys(abilities).map(a => `<li>${a} Lv${abilities[a]?.level || 1}</li>`).join('')}
    </ul>
  `;
}
