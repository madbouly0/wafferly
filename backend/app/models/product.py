from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()


class Product(Base):
    __tablename__ = 'products'

    id = Column(Integer, primary_key=True, autoincrement=True)
    url = Column(String(2048), nullable=False, unique=True)
    title = Column(String(500))
    image = Column(String(2048))
    currency = Column(String(10), default='$')
    current_price = Column(DECIMAL(10, 2))
    original_price = Column(DECIMAL(10, 2))
    lowest_price = Column(DECIMAL(10, 2))
    highest_price = Column(DECIMAL(10, 2))
    average_price = Column(DECIMAL(10, 2))
    discount_rate = Column(Integer, default=0)
    description = Column(Text)
    category = Column(String(200))
    reviews_count = Column(Integer, default=0)
    stars = Column(DECIMAL(3, 2), default=0)
    is_out_of_stock = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    price_history = relationship('PriceHistory', back_populates='product', cascade='all, delete-orphan')
    subscribers = relationship('ProductSubscriber', back_populates='product', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'url': self.url,
            'title': self.title,
            'image': self.image,
            'currency': self.currency,
            'currentPrice': float(self.current_price) if self.current_price else 0,
            'originalPrice': float(self.original_price) if self.original_price else 0,
            'lowestPrice': float(self.lowest_price) if self.lowest_price else 0,
            'highestPrice': float(self.highest_price) if self.highest_price else 0,
            'averagePrice': float(self.average_price) if self.average_price else 0,
            'discountRate': self.discount_rate,
            'description': self.description,
            'category': self.category,
            'reviewsCount': self.reviews_count,
            'stars': float(self.stars) if self.stars else 0,
            'isOutOfStock': self.is_out_of_stock,
            'priceHistory': [ph.to_dict() for ph in self.price_history],
            'subscribers': [sub.to_dict() for sub in self.subscribers],
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }


class PriceHistory(Base):
    __tablename__ = 'price_history'

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey('products.id', ondelete='CASCADE'), nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    product = relationship('Product', back_populates='price_history')

    def to_dict(self):
        return {
            'price': float(self.price),
            'recordedAt': self.recorded_at.isoformat() if self.recorded_at else None,
        }


class ProductSubscriber(Base):
    __tablename__ = 'product_subscribers'

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey('products.id', ondelete='CASCADE'), nullable=False)
    email = Column(String(320), nullable=False)
    subscribed_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    product = relationship('Product', back_populates='subscribers')

    def to_dict(self):
        return {
            'email': self.email,
            'subscribedAt': self.subscribed_at.isoformat() if self.subscribed_at else None,
        }