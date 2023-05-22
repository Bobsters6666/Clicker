const app = Vue.createApp({
  data() {
    return {
      coins: 1500,
      // coins: parseInt(localStorage.getItem('coins')) || 1,

      player: {
        clickDamage: 1,
        level: 1,
        levelUpCost: 10,
        clickDamageIncreaseOnLevelUp: 1,
      },

      enemy: {
        boss: {
          types: ["/assets/enemies/mountain-drake.png"],
          totalHealth: 100,
          enemyHealth: 100,
          name: 'Boss'
        },

        minion: {
          types: ["/assets/enemies/gromp.png", "/assets/enemies/krug.png"],
          currentTypeIndex: 0,
          total: 10,
          current: 1,
          totalHealth: 20,
          enemyHealth: 20,
          name: 'Minion'
        }
      },

      heroes: {
        garen: {
          level: 0,
          damage: 0,
          levelUpCost: 50,
          damageIncreaseOnLevelUp: 15,
        },

        darius: {
          level: 0,
          damage: 0,
          levelUpCost: 1760,
          damageIncreaseOnLevelUp: 280
        }
      },

      displaying: {
        enemy: "/assets/enemies/gromp.png",
        name: '',
        currentHealth: 0,
        totalHealth: 0,
      },

      isBoss: false,
      activeTab : 'heroes',
      passiveDamage: 0,
      stage: 1,
      yesSound: true,
    };
  },
  methods: {
    handleClick(event) {
      const particlesContainer = document.querySelector('.sword-particles');
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.top = event.pageY + 'px';
      particle.style.left = event.pageX + 'px';
      particlesContainer.appendChild(particle);

      setTimeout(() => {
        particlesContainer.removeChild(particle);
      }, 500);

      this.displaying.currentHealth -= this.player.clickDamage;
      const audio = new Audio('/assets/audio/slash.wav')

      if (this.yesSound) { audio.play() };
    },

    onEnemyDeath() {
      const minion = this.enemy.minion
      if (minion.current >= minion.total) {
        this.showBoss()
      } else {
        if (this.displaying.currentHealth <= 0) {
          minion.currentTypeIndex = Math.floor(Math.random() * minion.types.length)

          this.displaying.enemy = minion.types[minion.currentTypeIndex]
  
          this.displaying.currentHealth = this.displaying.totalHealth
          minion.current++;
          this.coins += Math.floor(4 + this.stage ** 2.3)
          localStorage.setItem('coins', this.coins.toString());
        }
      }
    },

    showBoss() {
      this.isBoss = true
      const displaying = this.displaying
      const boss = this.enemy.boss

      displaying.enemy = boss.types[0]
      displaying.name = boss.name
      displaying.currentHealth = Math.ceil(boss.enemyHealth * 2.6**this.stage)
      displaying.totalHealth = Math.ceil(boss.enemyHealth * 2.6**this.stage)
    },

    onBossDeath() {
      if (this.displaying.currentHealth <= 0) {
        const minion = this.enemy.minion
        const displaying = this.displaying
    
        this.stage++
    
        minion.current = 1
        displaying.enemy = minion.types[0]
        displaying.name = minion.name
        displaying.currentHealth = Math.floor(minion.enemyHealth * 2.3 ** this.stage)
        displaying.totalHealth = displaying.currentHealth
        this.isBoss = false
      }
    },

    handlePlayerLevelUp() {
      if (this.coins >= this.player.levelUpCost) {
        this.player.level ++;
        this.player.clickDamage += this.player.clickDamageIncreaseOnLevelUp;
        this.coins -= this.player.levelUpCost
        this.player.levelUpCost = Math.ceil(10 + 1.20**this.player.level);
        this.player.clickDamageIncreaseOnLevelUp = Math.floor(1.12**this.player.level)
      }
    },

    handleNewHeroPurchase() {
      return
    },

    handleHeroLevelUp(h) {
      Object.keys(this.heroes).forEach((heroKey) => {
        const hero = this.heroes[heroKey]
        if (h == heroKey && this.coins > hero.levelUpCost) {
          hero.level ++
          this.coins -= hero.levelUpCost
          hero.levelUpCost = Math.ceil(hero.levelUpCost**1.003);
          hero.damage += hero.damageIncreaseOnLevelUp 
          hero.damageIncreaseOnLevelUp = Math.floor(hero.damageIncreaseOnLevelUp**1.003)
        }
      });
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

  //Reactive, automatically updated whenever dependencies change. 
  computed: {
    totalHeroesDamage() {
      return Object.values(this.heroes).reduce((total, hero) => total + hero.damage, 0)
    }
  },

  watch: {
    'displaying.currentHealth'(newValue) {
      gsap.to(".hp-remaining", {
        width: `${(newValue / this.displaying.totalHealth) * 100}%`,
        duration: 0.3,
        ease: "power2.out",
      });

      

      if (!this.isBoss) {
        this.onEnemyDeath()
      } else {
        this.onBossDeath()
      }
    },

    totalHeroesDamage(newValue) {
      this.passiveDamage = newValue
    }
  },

  mounted() {
    setInterval(() => {
      this.displaying.currentHealth -= this.passiveDamage;
    }, 500),

    this.displaying.currentHealth = this.enemy.minion.enemyHealth
    this.displaying.totalHealth = this.enemy.minion.totalHealth
    this.displaying.name = this.enemy.minion.name
  },
});

app.mount('#app');