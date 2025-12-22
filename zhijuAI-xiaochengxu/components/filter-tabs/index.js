Component({
    properties: {
        currentFilter: {
            type: String,
            value: 'all'
        }
    },

    data: {
        tabs: [
            { label: "全部", value: "all" },
            { label: "已租", value: "rented" },
            { label: "空置", value: "vacant" }
        ]
    },

    methods: {
        onChange(e) {
            const value = e.currentTarget.dataset.value;
            this.triggerEvent('filterChange', { filter: value });
        }
    }
})
