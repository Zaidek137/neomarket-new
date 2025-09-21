# RPC Call Optimization Plan

## 🚨 Critical Issues Found

### 1. **useContractEvents** (Highest Priority)
**File:** `DarkCircuitPage.tsx`
**Issue:** Continuously polling eth_getLogs for Transfer events
**Impact:** Very High - Constant RPC calls
**Solution:** 
- Replace with manual refresh button
- Add caching with localStorage
- Use intervals instead of continuous polling

### 2. **Multiple getOwnedNFTs Calls** (High Priority)
**Files:** `MyEkosPage.tsx`, `useEkoOwnership.ts`, `BurnExchangeComponents.tsx`
**Issue:** Each component fetches NFTs independently
**Impact:** High - Multiple calls for same data
**Solutions:**
- Create shared NFT cache/context
- Add localStorage caching with TTL
- Debounce calls when wallet changes

### 3. **Marketplace Listings** (Medium Priority)
**File:** `ExchangePage.tsx`
**Issue:** Fetches all listings + metadata on every price change
**Impact:** Medium - Triggered by price updates
**Solutions:**
- Cache listings for 5-10 minutes
- Separate price updates from listing fetching
- Lazy load NFT metadata

## 🔧 Implementation Priority

### Phase 1: Quick Wins (1-2 hours)
1. Remove/disable useContractEvents temporarily
2. Add localStorage caching to getOwnedNFTs calls
3. Debounce wallet change effects

### Phase 2: Structural Improvements (2-4 hours)
1. Create shared NFT context/cache
2. Implement smart caching with TTL
3. Add manual refresh buttons where needed

### Phase 3: Advanced Optimizations (4+ hours)
1. Implement proper event listening with websockets
2. Add background sync for critical data
3. Optimize metadata fetching with batching

## 📊 Expected Impact

- **Phase 1:** 60-80% reduction in RPC calls
- **Phase 2:** 80-90% reduction in RPC calls  
- **Phase 3:** 90-95% reduction in RPC calls

## 🎯 Immediate Actions

1. **Disable useContractEvents** in DarkCircuitPage
2. **Add caching** to useEkoOwnership hook
3. **Debounce** MyEkosPage NFT fetching
4. **Cache marketplace** listings in ExchangePage
