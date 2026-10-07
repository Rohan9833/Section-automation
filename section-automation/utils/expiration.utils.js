function computeExpiresAt(expiration, customExpiration) {
    if(!expiration || expiration === "never") return null;

    if(expiration === "custom") {
        return customExpiration ? new Date(customExpiration) : null;
    }

    const days = {"1d": 1, "7d": 7, "30d": 30, "90d": 90}[expiration];
    if(!days) return null;

    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

module.exports = { computeExpiresAt };