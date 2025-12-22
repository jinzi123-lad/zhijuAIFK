// 房东端底部导航组件
Component({
  properties: {
    selected: {
      type: String,
      value: 'home'
    }
  },
  data: {},
  methods: {
    switchTab(e) {
      const { path, key } = e.currentTarget.dataset

      // 如果点击的是当前选中项，不做任何操作
      if (key === this.properties.selected) {
        return
      }

      // 跳转到对应页面
      wx.reLaunch({ url: path })
    },

    onAdd() {
      wx.showActionSheet({
        itemList: ['添加房源', '发起签约', '新建工单'],
        success: (res) => {
          const urls = [
            '/pages/landlord/property/add/index',
            '/pages/landlord/contract/create/index',
            '/pages/landlord/maintenance/index'
          ]
          if (urls[res.tapIndex]) {
            wx.navigateTo({ url: urls[res.tapIndex] })
          }
        }
      })
    }
  }
})
