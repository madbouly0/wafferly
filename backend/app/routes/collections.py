from flask import Blueprint, jsonify, request
from sqlalchemy import func
from app import get_db
from app.models.collection import Collection
from app.models.product import Product
from app.routes.auth import get_current_user

collections_bp = Blueprint('collections', __name__)

@collections_bp.route('/collections', methods=['GET'])
def get_collections():
    db = next(get_db())
    user = get_current_user(db)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        collections = db.query(Collection).filter(Collection.user_id == user.id).all()
        if not collections:
            return jsonify({"data": []}), 200

        collection_ids = [c.id for c in collections]

        # 1. Fetch counts in ONE query instead of N queries
        counts_query = db.query(Product.collection_id, func.count(Product.id)).filter(
            Product.collection_id.in_(collection_ids)
        ).group_by(Product.collection_id).all()
        counts_map = {row[0]: row[1] for row in counts_query}

        result = []
        for col in collections:
            col_dict = col.to_dict()
            # Get up to 4 product preview images for the collage cover
            products = db.query(Product.image).filter(Product.collection_id == col.id, Product.image != None).limit(4).all()
            
            col_dict['productCount'] = counts_map.get(col.id, 0)
            col_dict['previewImages'] = [p[0] for p in products]
            result.append(col_dict)
        return jsonify({"data": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@collections_bp.route('/collections', methods=['POST'])
def create_collection():
    db = next(get_db())
    user = get_current_user(db)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    name = data.get('name', '').strip()
    if not name:
        return jsonify({"error": "Collection name is required"}), 400

    try:
        new_col = Collection(name=name, user_id=user.id)
        db.add(new_col)
        db.commit()
        db.refresh(new_col)
        new_col_dict = new_col.to_dict()
        new_col_dict['productCount'] = 0
        new_col_dict['previewImages'] = []
        return jsonify({"data": new_col_dict}), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@collections_bp.route('/collections/<int:col_id>', methods=['PUT'])
def rename_collection(col_id):
    db = next(get_db())
    user = get_current_user(db)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    new_name = data.get('name', '').strip()
    if not new_name:
        return jsonify({"error": "New name is required"}), 400

    try:
        col = db.query(Collection).filter(Collection.id == col_id, Collection.user_id == user.id).first()
        if not col:
            return jsonify({"error": "Collection not found"}), 404
        col.name = new_name
        db.commit()
        db.refresh(col)
        return jsonify({"data": col.to_dict()}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@collections_bp.route('/collections/<int:col_id>', methods=['DELETE'])
def delete_collection(col_id):
    db = next(get_db())
    user = get_current_user(db)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        col = db.query(Collection).filter(Collection.id == col_id, Collection.user_id == user.id).first()
        if not col:
            return jsonify({"error": "Collection not found"}), 404
        db.delete(col)
        db.commit()
        return jsonify({"message": "Collection deleted successfully"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@collections_bp.route('/products/<int:product_id>/move', methods=['PATCH'])
def move_product(product_id):
    db = next(get_db())
    user = get_current_user(db)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    col_id = data.get('collectionId')  # Can be None/null to move out of collection

    try:
        # User must be subscribed to this product to move it.
        from app.models.product import ProductSubscriber
        sub = db.query(ProductSubscriber).filter(
            ProductSubscriber.product_id == product_id,
            ProductSubscriber.user_id == user.id
        ).first()

        if not sub:
            return jsonify({"error": "You are not tracking this product"}), 403

        prod = db.query(Product).filter(Product.id == product_id).first()
        if not prod:
            return jsonify({"error": "Product not found"}), 404

        if col_id is not None:
            # Verify the collection exists and belongs to user
            col = db.query(Collection).filter(Collection.id == col_id, Collection.user_id == user.id).first()
            if not col:
                return jsonify({"error": "Target collection not found or unauthorized"}), 404
            
        prod.collection_id = col_id
        db.commit()
        return jsonify({"message": "Product moved successfully", "data": {"productId": prod.id, "collectionId": prod.collection_id}}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()
