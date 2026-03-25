// ... existing code ...
// Find the CardHeader section around line 730 and update it

// Current code (around line 730-760):
/*
<CardHeader>
  <div className="flex items-center justify-between w-full flex-wrap gap-2">
    {/* Filtros de fecha a la izquierda */}
    <div className="flex gap-2">
      <Select value={filterYear} onValueChange={setFilterYear}>
        <SelectTrigger className="w-[90px] bg-zinc-800 border-zinc-700 text-white text-xs">
          <SelectValue placeholder="Año" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-zinc-700">
          <SelectItem value="all" className="text-white text-xs">
            Todos
          </SelectItem>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()} className="text-white text-xs">
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filterMonth} onValueChange={setFilterMonth}>
        <SelectTrigger className="w-[90px] bg-zinc-800 border-zinc-700 text-white text-xs">
          <SelectValue placeholder="Mes" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-zinc-700">
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value} className="text-white text-xs">
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    {/* Título a la derecha */}
    <CardTitle className="text-white flex items-center gap-2">
      <TrendingUp className="w-5 h-5 text-green-500" />
      Historial
    </CardTitle>
  </div>
</CardHeader>
*/

// New code - Title on the left, filters below:
<CardHeader>
  <div className="flex flex-col gap-3">
    {/* Título a la izquierda como protagonista */}
    <CardTitle className="text-white flex items-center gap-2 text-xl">
      <TrendingUp className="w-5 h-5 text-green-500" />
      Historial
    </CardTitle>
    {/* Filtros de fecha debajo del título */}
    <div className="flex gap-2">
      <Select value={filterYear} onValueChange={setFilterYear}>
        <SelectTrigger className="w-[90px] bg-zinc-800 border-zinc-700 text-white text-xs">
          <SelectValue placeholder="Año" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-zinc-700">
          <SelectItem value="all" className="text-white text-xs">
            Todos
          </SelectItem>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()} className="text-white text-xs">
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filterMonth} onValueChange={setFilterMonth}>
        <SelectTrigger className="w-[90px] bg-zinc-800 border-zinc-700 text-white text-xs">
          <SelectValue placeholder="Mes" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-zinc-700">
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value} className="text-white text-xs">
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
</CardHeader>