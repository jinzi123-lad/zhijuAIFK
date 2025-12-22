Component({
    properties: {
        property: {
            type: Object,
            value: {}
        }
    },

    data: {
        propertyCategoryLabels: {
            residential: "普通住宅",
            villa: "别墅",
            urban_apartment: "城市公寓",
            village_apartment: "城中村公寓"
        }
    },

    methods: {
        onTap() {
            this.triggerEvent('click', { property: this.properties.property });
        }
    }
})
