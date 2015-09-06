function TerrainCell(terrain, i, j, value, virtual) {
    this.terrain = terrain;
    this.i = i;
    this.j = j;
    this.value = value;
    this.virtual = !!virtual;
}

module.exports = TerrainCell;