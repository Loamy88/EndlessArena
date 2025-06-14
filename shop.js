// shop.js

function weightedRandom(items) {
  let total = items.reduce((acc, i) => acc + i.weight, 0);
  let randVal = Math.random() * total;
  for (let item of items) {
    if (randVal < item.weight) return item.type;
    randVal -= item.weight;
  }
}

let lastRerollCost = 20;

function showShop() {
  shopEl.style.display = 'block';
  upgradeSlots.innerHTML = '';
  statsEl.innerHTML = `Health: ${player.health}/${player.maxHealth}<br>Speed: ${stats.speed.toFixed(1)}<br>Abilities: ${Object.keys(abilities).join(', ')}`;

  rerollBtn.onclick = rerollUpgrades;
  rerollUpgrades();
}

function rerollUpgrades() {
  upgradeSlots.innerHTML = '';
  lastRerollCost = rand(15, 25);
  rerollBtn.textContent = `Reroll (${lastRerollCost}g)`;

  const upgradeClasses = [
    { type: 'health', weight: 5 },
    { type: 'speed', weight: 5 },
    { type: 'newAbility', weight: 2 },
    { type: 'upgradeAbility', weight: 4 }
  ];

  const abilityTypes = [
    { type: 'lifeSteal', weight: 2 },
    { type: 'projectiles', weight: 3 },
    { type: 'energyRing', weight: 2 },
    { type: 'lightning', weight: 1 }
  ];

  function generateUpgradeSlot() {
    const upgradeType = weightedRandom(upgradeClasses);
    let text = '';
    let cost = rand(5, 12);

    if (upgradeType === 'health') {
      const isHeal = Math.random() < 0.5;
      const amount = rand(10, 30);
      text = isHeal ? `Heal +${amount}` : `Max Health +${amount}`;
    } else if (upgradeType === 'speed') {
      const amount = (Math.random() * 0.6 + 0.2).toFixed(1);
      text = `Speed +${amount}`;
    } else if (upgradeType === 'newAbility') {
      const remaining = abilityTypes.filter(a => !abilities[a.type]);
      if (remaining.length > 0) {
        const ability = weightedRandom(remaining);
        text = `New Ability: ${ability}`;
      } else {
        return generateUpgradeSlot();
      }
    } else if (upgradeType === 'upgradeAbility') {
      const owned = Object.keys(abilities).filter(a => a !== 'melee');
      if (owned.length > 0) {
        const upgrade = owned[rand(0, owned.length - 1)];
        text = `Upgrade Ability: ${upgrade}`;
      } else {
        return generateUpgradeSlot();
      }
    }

    const div = document.createElement('div');
    div.className = 'upgrade-slot';
    div.innerHTML = `${text} - <button onclick="purchaseUpgrade('${text}', ${cost})">Buy (${cost}g)</button>`;
    upgradeSlots.appendChild(div);
  }

  for (let i = 0; i < 3; i++) generateUpgradeSlot();
}

function purchaseUpgrade(text, cost) {
  if (gold < cost) return;
  gold -= cost;

  if (text.startsWith('Heal +')) {
    const amount = parseInt(text.split('+')[1]);
    player.health = Math.min(player.maxHealth, player.health + amount);
  } else if (text.startsWith('Max Health +')) {
    const amount = parseInt(text.split('+')[1]);
    player.maxHealth += amount;
    player.health += amount;
  } else if (text.startsWith('Speed +')) {
    const amount = parseFloat(text.split('+')[1]);
    stats.speed += amount;
    player.speed = stats.speed;
  } else if (text.startsWith('New Ability:')) {
    const ability = text.split(': ')[1];
    abilities[ability] = true;
  } else if (text.startsWith('Upgrade Ability:')) {
    const ability = text.split(': ')[1];
    // Add upgrade effects for each ability here
    // This part will be implemented later in game.js
  }

  showShop();
}
