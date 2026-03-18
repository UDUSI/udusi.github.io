### 2026-03-18
- In addition to the SI Reference Point, UDUSI now also draws on complementary information from three major unit vocabularies [QUDT](https://qudt.org), [NERC Vocabulary Server (NVS)](https://vocab.nerc.ac.uk/), and [UCUM](https://ucum.org/):
  - The link to the SI Reference Point entry for SI prefixes and units now has its own button (*Layout change*). 
  - For prefixes and units shared with QUDT, a link to the corresponding [QUDT Units Catalog](https://qudt.org/doc/2026/02/DOC_VOCAB-UNITS-ALL.html) entry is now available as a button (*New*).
  - For units shared with  the [NVS P06 unit vocabulary](https://vocab.nerc.ac.uk/collection/P06/current/) a link to the vocabulary entry is now available as a button (*New*).
  - In the navigation area (left) it is now possible to select presentation format for units (*Experimental*).
  - For units shared with QUDT, the corresponding UCUM unit representation is presented where available from the QUDT Catalog entry (*New*).
  - For units shared with QUDT the base quantity dimension is presented, as well as   quantities, now drawn from the corresponding QUDT Catalog entries (*New*).
- Corrected the conversion factor for `footcandle`, which was previously off by a factor of 100.

### 2026-03-03
- Major refactoring of the infrastructure producing the web pages:
  - Direct access to the SI Reference Point API.
  - Added search function for unit names, symbols, and their aliases.
  - The web site address is now `https://udusi.github.io`, but the old one will redirect to this address.
- Updated and corrected description of units related to year and month, but their actual conversion factors remain untouched.
- Many minor adjustments and corrections.

### 2025-04-10
- Initial publication of the UDUSI web pages under the address `<http://udusi.github.io/UDUSI>`.
