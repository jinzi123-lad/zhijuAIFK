import base64
import os

# 创建目录
tabbar_dir = r'c:\Users\enlightv\Desktop\zhijuAIFK\zhijuAI-xiaochengxu\images\tabbar'
os.makedirs(tabbar_dir, exist_ok=True)

# 简单的50x50像素灰色PNG图标 (最小有效PNG)
# 这是一个简约的圆圈图标
gray_icon = base64.b64decode(
    'iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAJlJREFUaIHtz0EKwCAMRNHp/Q/dZpFCoSCKjjP/baC4+MQoAAAAAPBnRNzrPU96Zu7bPSI+tn1xc6xE5HV5s+26vNk2C5FX5c222TYLkVflzbbZNguRV+XNttk2C5FX5c222TYLkVflzbbZNguRV+XNttk2C5FX5c222TYLkVflzbbZNguRV+XNttk2CwEAAAAAAPAKP9p1UQXH7iUAAAAASUVORK5CYII='
)

blue_icon = base64.b64decode(
    'iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAKBJREFUaIHtz0EKwCAMRNHp/Q/dZpFCoSCKjjP/raBZ/IkRAAAAAMCfich3e8+Tntn17R4RH9u+uDlWIvL6+mbb93mzbRYiL8ubbdflzbZZiLwsb7Z9nzfbZiHysrzZdl3ebJuFyMvyZtv3ebNtFiIvy5tt1+XNtlmIvCxvtn2fN9tmIfKyvNl2Xd5sm4UAAAAAAABYyg8H2VF5RKT0hwAAAABJRU5ErkJggg=='
)

# 为4个tab创建图标
icons = ['home', 'property', 'contract', 'profile']
for name in icons:
    # 普通状态 (灰色)
    with open(os.path.join(tabbar_dir, f'{name}.png'), 'wb') as f:
        f.write(gray_icon)
    # 选中状态 (蓝色)
    with open(os.path.join(tabbar_dir, f'{name}_active.png'), 'wb') as f:
        f.write(blue_icon)

print("TabBar图标创建完成!")
