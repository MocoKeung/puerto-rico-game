import random

# 定义资源类型
RESOURCES = ['玉米', '靛蓝', '糖', '烟草', '咖啡', '金币']

# 定义角色卡
class CharacterCard:
    def __init__(self, name, description):
        self.name = name
        self.description = description

# 定义玩家类
class Player:
    def __init__(self, name):
        self.name = name
        self.resources = {res: 0 for res in RESOURCES}
        self.hand = []
        self.skills = []

    def add_resource(self, resource, amount=1):
        if resource in self.resources:
            self.resources[resource] += amount

    def add_card_to_hand(self, card):
        self.hand.append(card)

    def play_skill_card(self, card_name):
        for card in self.skills:
            if card.name == card_name:
                print(f"{self.name} 使用了 {card.name} 技能: {card.description}")
                return True
        print(f"{self.name} 没有找到技能卡 {card_name}")
        return False

# 创建角色卡实例
character_cards = [
    CharacterCard("市长", "收集殖民者"),
    CharacterCard("商人", "出售货物"),
    CharacterCard("建造者", "建造建筑"),
    CharacterCard("船长", "运输货物"),
    CharacterCard("工艺大师", "生产货物"),
    CharacterCard("探险家", "发现新大陆"),
    CharacterCard("财务官", "获得金币")
]

# 初始化游戏
def initialize_game():
    players = [Player(f"玩家{i+1}") for i in range(4)]
    
    # 洗牌
    random.shuffle(character_cards)
    
    # 分发初始手牌（每人两张）
    for player in players:
        player.add_card_to_hand(character_cards.pop())
        player.add_card_to_hand(character_cards.pop())
        
    return players

# 主游戏循环
def main_game_loop(players):
    round_count = 1
    game_over = False
    
    while not game_over:
        print(f"\n--- 第 {round_count} 轮 ---")
        
        # 每个玩家轮流行动
        for player in players:
            print(f"\n{player.name} 的回合:")
            
            # 显示手牌
            if player.hand:
                print(f"手牌: {[card.name for card in player.hand]}")
                
                # 玩家选择一张手牌使用
                selected_card = random.choice(player.hand)  # 简化处理，随机选择
                player.play_skill_card(selected_card.name)
                
                # 移除已使用的卡牌
                player.hand.remove(selected_card)
            else:
                print("没有手牌可以使用")
                
            # 检查游戏结束条件（简化版）
            total_resources = sum(player.resources.values())
            if total_resources >= 50:  # 假设资源总数达到50即为胜利条件
                print(f"\n🎉 {player.name} 获得了胜利！")
                game_over = True
                break
                
        round_count += 1
        
        # 防止无限循环（实际游戏中应根据具体规则调整）
        if round_count > 20:
            print("\n⚠️ 游戏超过20轮，强制结束")
            break
            
# 主函数
if __name__ == "__main__":
    print("欢迎来到波多黎各桌游！")
    players = initialize_game()
    main_game_loop(players)
    print("感谢游玩！")