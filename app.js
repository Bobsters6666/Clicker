const app = Vue.createApp({
  data() {
    return {
      coins: parseInt(localStorage.getItem('coins')) || 15,

      player: {
        clickDamage: 1,
        level: 1,
        levelUpCost: 10,
        clickDamageIncreaseOnLevelUp: 1,
      },

      enemy: {
        boss: {
          types: ["assets/enemies/mountain-drake.png"],
          totalHealth: 100,
          enemyHealth: 100,
          name: 'Boss',
          totalTime: 30,
          currentTime: 30,
        },

        minion: {
          types: ["assets/enemies/gromp.png", "assets/enemies/krug.png"],
          currentTypeIndex: 0,
          total: 10,
          current: 1,
          totalHealth: 12,
          enemyHealth: 12,
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

      skills: {
        judgement: {
          level: 0,
          damage: 0,
          levelUpCost: 900,
          damageIncreaseOnLevelUp: 4560,
          cooldown: 900
        },

        gullotine: {
          level: 0,
          damage: 0,
          levelUpCost: 63000,
          damageIncreaseOnLevelUp: 120980,
          cooldown: 1200
        }
      },

      displaying: {
        enemy: "assets/enemies/gromp.png",
        name: '',
        currentHealth: 0,
        totalHealth: 0,
      },

      isBoss: false,
      isTrainingGround: false,
      activeTab : 'closed',
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
      particle.style.left = (event.pageX - document.body.getBoundingClientRect().left) + 'px';
      particlesContainer.appendChild(particle);

      setTimeout(() => {
        particlesContainer.removeChild(particle);
      }, 500);

      this.displaying.currentHealth -= this.player.clickDamage;
      const audio = new Audio('assets/audio/slash.wav')

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
          this.coins += Math.floor(4 + this.stage ** 2.3)
          localStorage.setItem('coins', this.coins.toString());

          if (!this.isTrainingGround) {
            minion.current++;
          }
        }
      }
    },

    showMinion () {
      this.isBoss = false
      const displaying = this.displaying
      const minion = this.enemy.minion

      displaying.enemy = minion.types[0]
      displaying.name = minion.name
      displaying.currentHealth = Math.floor(minion.enemyHealth * 2.1 ** this.stage)
      displaying.totalHealth = displaying.currentHealth
    },

    showBoss() {
      this.isBoss = true
      const displaying = this.displaying
      const boss = this.enemy.boss

      displaying.enemy = boss.types[0]
      displaying.name = boss.name
      displaying.currentHealth = Math.ceil(boss.enemyHealth * 2.2**this.stage)
      displaying.totalHealth = Math.ceil(boss.enemyHealth * 2.2**this.stage)
    },

    onBossDeath() {
      if (this.displaying.currentHealth <= 0) {
        const minion = this.enemy.minion
        const displaying = this.displaying
    
        this.stage++
        this.coins += Math.floor(30 + this.stage ** 4.7)
    
        minion.current = 1
        
        this.showMinion()

        this.enemy.boss.currentTime = this.enemy.boss.totalTime
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
          hero.levelUpCost = Math.ceil(hero.levelUpCost**1.015);
          hero.damage += hero.damageIncreaseOnLevelUp 
          hero.damageIncreaseOnLevelUp = Math.floor(hero.damageIncreaseOnLevelUp**1.027)
        }
      });
    },

    handleTrainingGround() {
      //when minions is 10/10 isBoss turns true for some reason. 
      this.enemy.minion.current -= 1
      this.isTrainingGround = true
      this.enemy.boss.currentTime = this.enemy.boss.totalTime
      this.showMinion()
    },

    handleFightBossButtonClicked () {
      this.enemy.minion.current += 1
      this.isTrainingGround = false
      this.showBoss()
    },

    handleNewSkillPurhcase() {
      return
    },

    handleSkillLevelUp() {
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
        ease: "ease.inOut",
      });

      if (!this.isBoss) {
        this.onEnemyDeath()
      } else {
        this.onBossDeath()
      }
    },

    'enemy.boss.currentTime'(newValue) {
      gsap.to(".boss-timer", {
        width: `${(newValue / this.enemy.boss.totalTime) * 100}% `,
        duration: 0.1,
        ease: "ease.inOut"
      }) 
    },

    'isBoss'() {
      if (this.isBoss) {
        // Clear the previous interval
        clearInterval(this.bossInterval);
        
        // Create a new interval for the boss countdown
        this.bossInterval = setInterval(() => {
          if (this.enemy.boss.currentTime <= 0) {
            this.handleTrainingGround();
          } else {
            this.enemy.boss.currentTime -= 0.1;
          }
        }, 100);
      } else {
        // Clear the interval when isBoss becomes false
        clearInterval(this.bossInterval);
      }
    },


    totalHeroesDamage(newValue) {
      this.passiveDamage = newValue
    }
  },

  mounted() {
    setInterval(() => {
      this.displaying.currentHealth -= this.passiveDamage;
    }, 500);


    this.showMinion()
  },
});

app.mount('#app');