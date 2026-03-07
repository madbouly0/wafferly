from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import uuid

# Base is the parent class that all our database models will inherit from
Base = declarative_base()


class Product(Base):
    # This tells SQLAlchemy which table in the database this class maps to
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

    # These link the product to its price history and subscriber records
    price_history = relationship('PriceHistory', back_populates='product', cascade='all, delete-orphan')
    subscribers = relationship('ProductSubscriber', back_populates='product', cascade='all, delete-orphan')

    def to_dict(self):
        # Convert this product into a plain dictionary so we can send it as JSON
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

    # Link back to the product this price belongs to
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

    # target_price: the user's personal price goal — e.g. "notify me when it drops below $40"
    # This is optional — if None, we fall back to notifying on any price drop
    target_price = Column(DECIMAL(10, 2), nullable=True)

    # unsubscribe_token: a unique random string we put in every email
    # When the user clicks "Unsubscribe", this token tells us which subscription to delete
    # We use uuid4() to generate a different random token for every subscriber
    unsubscribe_token = Column(String(100), nullable=False, default=lambda: str(uuid.uuid4()))

    # Link back to the product this subscriber is watching
    product = relationship('Product', back_populates='subscribers')

    def to_dict(self):
        return {
            'email': self.email,
            'targetPrice': float(self.target_price) if self.target_price else None,
            'subscribedAt': self.subscribed_at.isoformat() if self.subscribed_at else None,
            'unsubscribeToken': self.unsubscribe_token,
        }