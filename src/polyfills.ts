if (!Array.prototype['includes']) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(el) {
      return this.indexOf(el) > -1
    }
  })
}
