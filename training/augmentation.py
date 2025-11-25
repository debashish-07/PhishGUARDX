import random
import string

class DataAugmentor:
    def __init__(self):
        self.homoglyphs = {
            'a': ['à', 'á', 'â', 'ã', 'ä', 'å', 'ɑ', 'а'],
            'e': ['è', 'é', 'ê', 'ë', 'ē', 'ė', 'ę', 'е'],
            'i': ['ì', 'í', 'î', 'ï', 'ī', 'į', 'і'],
            'o': ['ò', 'ó', 'ô', 'õ', 'ö', 'ō', 'ø', 'о'],
            'u': ['ù', 'ú', 'û', 'ü', 'ū', 'ų'],
            'c': ['ç', 'ć', 'č', 'с'],
            'n': ['ñ', 'ń', 'ņ'],
            's': ['ś', 'š', 'ş'],
            'y': ['ý', 'ÿ'],
            'z': ['ź', 'ż', 'ž']
        }

    def homoglyph_attack(self, url, prob=0.3):
        """Replace characters with look-alike homoglyphs."""
        chars = list(url)
        for i, char in enumerate(chars):
            if char in self.homoglyphs and random.random() < prob:
                chars[i] = random.choice(self.homoglyphs[char])
        return "".join(chars)

    def subdomain_injection(self, url):
        """Inject a target brand as a subdomain."""
        brands = ['paypal', 'google', 'apple', 'microsoft', 'amazon']
        brand = random.choice(brands)
        parts = url.split('//')
        if len(parts) > 1:
            return f"{parts[0]}//{brand}.com-{parts[1]}"
        return f"{brand}.com-{url}"

    def generate_adversarial_samples(self, urls, count=10):
        """Generate a batch of adversarial samples."""
        samples = []
        for _ in range(count):
            url = random.choice(urls)
            method = random.choice([self.homoglyph_attack, self.subdomain_injection])
            samples.append(method(url))
        return samples

if __name__ == "__main__":
    augmentor = DataAugmentor()
    base_urls = ["http://example.com/login", "https://secure-bank.com"]
    
    print("Generating adversarial samples...")
    samples = augmentor.generate_adversarial_samples(base_urls, count=5)
    for s in samples:
        print(s)
