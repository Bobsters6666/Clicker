const app = Vue.createApp({
  data() {
    return {
      coins: parseInt(localStorage.getItem('coins')) || 1,

      player: {
        clickDamage: 1,
        level: 1,
        levelUpCost: 10,
        clickDamageIncreaseOnLevelUp: 1,
      },

      enemy: {
        boss: {
          totalHealth: 100,
          currentHealth: 100,
          name: 'Abdullah'
        },

        minion: {
          total: 10,
          current: 1,
          totalHealth: 20,
          currentHealth: 20,
          name: 'Musa'
        }
      },

      activeTab : 'player',
      passiveDamage: 0,
      stage: 1,
      yesSound: true,
    };
  },
  methods: {
    handleClick() {
      localStorage.setItem('coins', this.coins.toString());

      this.enemy.minion.currentHealth -= this.player.clickDamage;
      this.onEnemyDeath()
      const audio = new Audio('/assets/audio/slash.wav')

      if (this.yesSound) { audio.play() };
    },

    onEnemyDeath() {
      if (this.enemy.minion.currentHealth <= 0) {
        this.enemy.minion.currentHealth = this.enemy.minion.totalHealth;
        this.enemy.minion.current++;
        this.coins += 5
      }
    },

    boss() {
      return
    },

    handlePlayerLevelUp() {
      if (this.coins >= this.player.levelUpCost) {
        this.player.level ++;
        this.player.clickDamage += this.player.clickDamageIncreaseOnLevelUp;
        this.coins -= this.player.levelUpCost
        this.player.levelUpCost = Math.ceil(10 + 1.08**this.player.level);
        this.player.clickDamageIncreaseOnLevelUp = Math.floor(1.29**this.player.level)
      }
    },

    handleNewHeroPurchase() {
      return
    },

    handleHeroLevelUp() {
      return
    },

    handleNewSkillPurhcase() {
      return
    },

    handleSkillUpdrade() {
      return
    },

    handleNewStage() {
      return
    },

    playAudio() {
      this.yesSound = !this.yesSound;
    },

    handleFooterTabClick(tab) {
      this.activeTab = tab
    }
  },

  watch: {
    'enemy.minion.currentHealth'(newValue) {
      gsap.to(".hp-remaining", {
        width: `${(newValue / this.enemy.minion.totalHealth) * 100}%`,
        duration: 0.3,
        ease: "power2.out",
      });
    },

    'enemy.minion.current'(newValue) {
      if ( newValue > this.enemy.minion.total) {
        console.log("Show boss")
      }
    }
  },

  mounted() {
    setInterval(() => {
      this.enemy.minion.currentHealth -= this.passiveDamage;
      this.onEnemyDeath()
    }, 1000);
  },
});

app.mount('#app');